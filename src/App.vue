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

        <!-- TODO debug, saa poistaa
          Pidemmän valikon testausta varten
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
//TODO should one always check for Oskari request availability / errors in order to make more general implementation
// (= degrades or informs if Oskari backend version does not support used request etc.)

export default {
  props: {
    source: String
  },
  data: () => ({
    drawer: null,
    // TODO rename
    selected: [],
    maplayers: [],
    channel: {}
  }),
  watch: {},
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
    }
  },

  mounted: function() {
    // TODO debug, remove
    console.log("App mounted!");
    this.initOskariChannel();
  }
};
</script>
