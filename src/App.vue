<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <!-- TODO remove unless more pages needed -->
        <!-- <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-contact-mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
        <v-list-item link v-for="maplayer in maplayers" :key="maplayer.id">
          <v-checkbox
            @change="getSelectedLayers($event)"
            v-model="selected"
            :label="maplayer.name"
            :value="maplayer.id"
            :checked="maplayer.visible"
          ></v-checkbox>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item>
          <v-switch
            @change="showAndUpdatePosition()"
            v-model="showPosition.status"
            label="Show my position"
          ></v-switch>
        </v-list-item>
        <v-list-item>
          <v-switch
            v-model="keepMapCenteredToPosition.status"
            label="Follow my position"
          ></v-switch>
        </v-list-item>
        <!-- <v-list-item>
          <v-switch
            v-model="keepMapRotationNorthUp"
            label="Keep north up"
          ></v-switch>
        </v-list-item> -->
        <!-- <v-divider></v-divider> -->
        <!-- <v-list-item>
          <v-btn @click="showUserLocation()">Show my location</v-btn>
        </v-list-item> -->
        <!-- <v-list-item>
          <span>Message: {{ locationData }}</span>
        </v-list-item>
        <v-list-item>
          <span>WATCH_ID: {{ showPosition.id }}</span>
        </v-list-item>
        <v-list-item>
          <span>Show position: {{ showPosition.status }}</span>
        </v-list-item>
        <v-list-item>
          <span>Keep centered: {{ keepMapCenteredToPosition.status }}</span>
        </v-list-item> -->

        <!-- TODO debug, remove
          test for menu scrolling
        -->
        <!-- <v-list-item link v-for="maplayer in maplayers" :key="maplayer.id">
          <v-checkbox
            @change="getSelectedLayers($event)"
            v-model="selected"
            :label="maplayer.name"
            :value="maplayer.id"
            :checked="maplayer.visible"
          ></v-checkbox>
        </v-list-item>
        <v-list-item link v-for="maplayer in maplayers" :key="maplayer.id">
          <v-checkbox
            @change="getSelectedLayers($event)"
            v-model="selected"
            :label="maplayer.name"
            :value="maplayer.id"
            :checked="maplayer.visible"
          ></v-checkbox>
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Virma Mobile</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col class="text-center">
            <div>
              <!-- vanhakoivu.net TODO remove when not needed -->
              <!-- <iframe
                id="map"
                src="https://karttapalvelu.lounaistieto.fi/?lang=fi&uuid=755ae93c-4030-4318-85fa-791af086d76a"
                allow="geolocation"
                style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden;"
              ></iframe> -->

              <!-- virma.fi -->
              <iframe
                id="map"
                src="https://karttapalvelu.lounaistieto.fi/?lang=fi&uuid=06575d35-a115-46fb-8480-77f9c1c68ced"
                allow="geolocation"
                style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden;"
              ></iframe>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
// TODO remove when geolocation api is not used anymore (but Oskari native requests instead)
import proj4 from "../node_modules/proj4";

//TODO should one always check for Oskari request availability / errors in order to make more general implementation
// (= degrades or informs if Oskari backend version does not support used request etc.)

export default {
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    // TODO rename selected
    selected: [],
    maplayers: [],
    showPosition: { status: false, id: "" },
    keepMapCenteredToPosition: { status: false },
    keepMapRotationNorthUp: true,
    channel: {},
    // TODO remove locationData, only for debug (remove also from template)
    locationData: []
  }),
  watch: {
    // TODO remove if not needed in zoom once -feature in showAndUpdatePosition
    // use closure instead?
    "showPosition.status": function(oldValue, newValue) {
      console.log("showPosition: " + oldValue + " -> " + newValue);
    }
  },
  methods: {
    initOskariChannel: function() {
      var IFRAME_DOMAIN = "https://karttapalvelu.lounaistieto.fi";
      var iFrame = document.getElementById("map");
      /* global OskariRPC */
      var channel = OskariRPC.connect(iFrame, IFRAME_DOMAIN);
      this.channel = channel;

      var oskariLayers = this.maplayers;
      var selectedLayers = this.selected;
      // TODO debug, remove
      console.log("channel ready");

      channel.onReady(function() {
        // TODO debug, remove
        console.log("channel onReady");
        // TODO refactor to function
        channel.getAllLayers(function(layers) {
          for (const layer of layers) {
            oskariLayers.push(layer);
            if (layer.visible) {
              selectedLayers.push(layer.id);
            }
            // TODO debug, remove
            console.log(
              `${layer.id} - ${layer.name} - visible: ${layer.visible}`
            );
            channel.handleEvent("MapClickedEvent", function(data) {
              // TODO debug, remove
              console.log("Coordinates: " + data.lon, data.lat);
            });
          }
        });
      });
    },

    // TODO refactor ?
    getSelectedLayers: function(e) {
      // TODO debug, remove
      console.log("getSelectedLayers: " + e + typeof e);
      let selected = e;
      let channel = this.channel;
      let layers = this.maplayers;

      for (const layerId of selected) {
        // TODO debug, remove
        console.log("Visible: " + layerId);
        channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
          layerId,
          true
        ]);
      }

      for (const layer of layers) {
        if (!selected.includes(layer.id)) {
          // TODO debug, remove
          console.log("Not visible: " + layer.id);
          channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
            layer.id,
            false
          ]);
        }
      }
    },

    // TODO reformat: pass argumets as object
    addMarker: function(positionEPSG3067, id = "marker", color = "#0377fc") {
      let channel = this.channel;
      channel.handleEvent("AfterAddMarkerEvent", function(data) {
        // TODO debug, remove
        console.log("Marker added", data.id);
      });

      // TODO debug, remove
      console.log("addMarker called");
      channel.postRequest("MapModulePlugin.AddMarkerRequest", [
        {
          x: positionEPSG3067.coords.longitude,
          y: positionEPSG3067.coords.latitude,
          color,
          msg: "",
          shape: 2,
          size: 2
        },
        id
      ]);
    },

    removeMarker: function(marker) {
      let channel = this.channel;
      channel.postRequest("MapModulePlugin.RemoveMarkersRequest", [marker]);
    },

    moveMap: function(positionEPSG3067) {
      let channel = this.channel;
      // TODO debug, remove
      console.log("moveMap: " + positionEPSG3067);
      channel.postRequest("MapMoveRequest", [
        positionEPSG3067.coords.longitude,
        positionEPSG3067.coords.latitude
      ]);
    },

    // TODO not needed with Oskari native request
    transformCoordinates: function(positionWGS84) {
      let positionEPSG3067 = { coords: {} };
      let transform = proj4("EPSG:3067", [
        positionWGS84.coords.longitude,
        positionWGS84.coords.latitude
      ]);
      positionEPSG3067.coords.longitude = transform[0];
      positionEPSG3067.coords.latitude = transform[1];
      return positionEPSG3067;
    },

    // TODO use Oskari native MyLocationPlugin.GetUserLocationRequest after Lounaisdata Oskari update
    // let channel = this.channel;
    //   var options = {
    //     enableHighAccuracy: true,
    //     timeout: 15000,
    //     addToMap: true
    //   };
    //   channel.postRequest("MyLocationPlugin.GetUserLocationRequest", [
    //     true,
    //     options
    //   ]);

    // TODO remove showUserLocation? getCurrentPosition is not optimal for this, it can be very deaccurate
    // now using showAndUpdatePosition instead (which can be refactored with Oskari native request after Oskari update)
    showUserLocation: function() {
      var locationData = this.locationData;
      var transformCoordinates = this.transformCoordinates;
      var moveMap = this.moveMap;
      var addMarker = this.addMarker;
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      function success(positionWGS84) {
        let positionEPSG3067 = transformCoordinates(positionWGS84);
        locationData.push(transformCoordinates(positionWGS84));
        moveMap(positionEPSG3067, 12);
        addMarker(positionEPSG3067, "getLocationMarker");
      }

      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        locationData.push(err.message);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    },

    showAndUpdatePosition: function() {
      if ("geolocation" in navigator) {
        var transformCoordinates = this.transformCoordinates;
        var moveMap = this.moveMap;
        var addMarker = this.addMarker;
        var removeMarker = this.removeMarker;
        var showPosition = this.showPosition;
        var keepMapCenteredToPosition = this.keepMapCenteredToPosition;
        var keepMapRotationNorthUp = this.keepMapRotationNorthUp;
        var moveOnce = (function() {
          var zoomed = false;
          return function(positionEPSG3067) {
            if (!zoomed) {
              zoomed = true;
              moveMap(positionEPSG3067);
            }
          };
        })();
        const options = {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000
        };

        // eslint-disable-next-line no-inner-declarations
        function success(positionWGS84) {
          let positionEPSG3067 = transformCoordinates(positionWGS84);
          addMarker(positionEPSG3067, "trackLocationMarker", "#fc030f");
          moveOnce(positionEPSG3067);

          if (keepMapCenteredToPosition.status) {
            moveMap(positionEPSG3067);
            // TODO set keepMapCenteredToPosition to false if user moves map (more than xx m?)
          }

          if (keepMapRotationNorthUp) {
            // TODO write body (get heading, rotate map)
          }

          // TODO remove console.logs
          console.log(
            positionWGS84.coords.latitude,
            positionWGS84.coords.longitude
          );
          console.log(
            `EPSG3067: ${positionEPSG3067.coords.longitude} ${positionEPSG3067.coords.latitude}`
          );
        }

        // eslint-disable-next-line no-inner-declarations
        function error() {
          console.log("no position available");
          alert("Sorry, no position available.");
        }

        showPosition.id = showPosition.status
          ? navigator.geolocation.watchPosition(success, error, options)
          : (navigator.geolocation.clearWatch(showPosition.id),
            removeMarker("trackLocationMarker"),
            console.log("trackLocationMarker"));
      } else {
        /* geolocation IS NOT available */
        console.log("geolocation IS NOT available");
      }

      // Oskari native request can be used when Lounaispaikka Oskari has updated (instead of current browser geolocation api)
      // let channel = this.channel;
      // var options = {
      //   centerMap: "update",
      //   addToMap: "location",
      //   enableHighAccuracy: true,
      //   timeout: 5000,
      //   maximumAge: 5000
      // };
      // channel.postRequest("StartUserLocationTrackingRequest", [options]);
    }
  },

  mounted: function() {
    // TODO debug, remove
    console.log("App mounted!");
    this.initOskariChannel();

    // TODO remove when geolocation api is not used anymore (but Oskari native requests instead)
    proj4.defs(
      "EPSG:3067",
      "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    );
  }
};
</script>
