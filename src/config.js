/* eslint-disable no-unused-vars */
export let mapLegend = {
  icons: {
    route: "m 10,7 c 6.6,-6.1 8.7,-3.5 13.8,-0.6 4.3,2.5 10.8,-5.43 10.8,-5.4"
  }
};

export let mapConfig = {
  mapAddress:
    "https://karttapalvelu.lounaistieto.fi/?lang=fi&uuid=a953c872-e32a-4c0f-a364-2c97d64f31a6"
};

export let searchConfig = {
  // TODO separate base address for points?
  baseAddress:
    "https://geoserver.lounaistieto.fi/geoserver/virma/wfs?request=GetFeature&service=WFS&version=1.0.0&outputFormat=application%2Fjson&typeName=",
  geoserverRoutesTypeName: "virma:virma_reitit_avoin",
  geoserverPointsTypeName: "virma:virma_kohteet_avoin",

  CQLFilters: {
    freeTextFilter: function(searchText) {
      return `name_fi ILIKE '%${searchText}%' OR name_se ILIKE '%${searchText}%' OR name_en ILIKE '%${searchText}%' OR
        info_fi ILIKE '%${searchText}%' OR info_se ILIKE '%${searchText}%' OR info_en ILIKE '%${searchText}%'`;
    },

    routeTypeFilter: function(routeType) {
      return `class2_fi = '${routeType}'`;
    },

    pointTypeFilter: function(pointType) {
      return `class2_fi = '${pointType}'`;
    },

    municipalityFilter: function(municipality) {
      return `municipali = '${municipality}'`;
    },

    maxDistanceFromLocationFilter: function(location, distance) {
      return `DWITHIN(geom,SRID=3067;POINT(${location.coords.longitude} ${location.coords.latitude}),${distance},kilometers)`;
    },

    routeLengthMinFilter: function(value) {
      return `geomLength(geom) > ${value * 1000}`;
    },

    routeLengthMaxFilter: function(value) {
      return `geomLength(geom) < ${value * 1000}`;
    }
  }
};

export let renderStructureTEST = {
  logLayerInfoToConsole: true,
  layersLoaded: false, // TODO why these (layersLoaded and parentPointersSet) are here - they are not configs?
  parentPointersSet: false, // TODO use this in v-if instead of layersLoaded
  layers: [
    // accordion either has or doesn't have subcontent.
    // Subcontent can be:
    // - WMS Layer
    // - self created layer with one or more WFS features
    // - virtual layer = accordion with no associated layer, but has subContent
    // - text / link content

    // On 'eye-event':
    // // if (!hasSubContent && hasId) if 'visible': turn it 'not visible' (how depends on checkbox(turn both visible and checked) or accordion?)
    // ( ja takaisin näkyviin: jokainen _checked_ -> visible)
    // function toggleVisibilityOrGoDeeper(item) { // item=esim. "Taustakartat"
    //  if (item.hasId) { turn id off, return }
    //  if (!hasId && type=="virtual" && hasSubContent) {
    //    for subItem in subContent {
    //      toggleVisibilityOrGoDeeper(subItem);
    //      return;
    //    }
    //  return; // no id, no subcontent
    //(id:virtual -> alemmas / id:text -> älä tee mitään)

    // Pitäsikö kaikki ehdot kirjottaa: if hasAttribute && attribute=xxx ettei nosta virhettä jos attr puuttuu

    // IMPORTANT! Functionality relies on every top level wfs layer to actually have layer that can be turned on/off as a whole
    // even if it has (one or many) subItems/subLayers (what was just said is true for subLayers also). Otherwise it has to be type: "virtual".
    // example: Kuntoradat -> Turku -> rata1, rata2 etc. Here Kuntoradat is supposedly wms-layer, but Turku is wfs-layer which is fetched
    // on user interaction. Then it has to be parsed as oskari-wfs-layer which includes wfs-features rata1, rata2 etc.
    // This way Turku-layer visibility can be turned on/off with single layer-id (instead of going through every subItem)

    // .type has to have value always, it's either virtual or 'real' layer. Possible values: virtual, wms, wfs (not yet implemented!), mitä muita
    // visible-attribute in config.js overrides visibility set in karttajulkaisu / Karttapalvelu

    // Level 0
    // Etsi-tulokset
    {
      name: "Etsi-tulokset",
      id: null,
      type: "wfs", // tämä on kai virtual niin kauan kunnes tulee tuloksia, jolloin täytetään id ja type
      visible: false,
      renderAs: "accordion",
      style: {
        backgroundColor: "#eedbad",
        class: "mb-8"
      },
      subContent: [
        // Level 1
        {
          name: "Ei vielä tuloksia, käytä <u>etsi-toimintoa</u>",
          // if name empty, use what comes from server
          id: null,
          type: "text",
          visible: false,
          checked: false, // checked-attribuutti vain jos renderAs="checkbox"
          renderAs: "text"
        }
      ]
    },

    // Taustakartat
    {
      name: "Taustakartat",
      id: null,
      type: "virtual",
      visible: true,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e6e8dd",
        class: "mb-4"
      },
      subContent: [
        // Level 1
        {
          name: "Taustakartta",
          id: 327,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox"
        },
        {
          name: "Maastokartta",
          id: 1175,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox"
        },
        {
          name: "OpenStreetMap",
          id: 329,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox"
        }
      ]
    },

    // Kohteet
    {
      name: "Varsinais-Suomen virkistyskohteet",
      id: 1049, //1166,
      type: "wms",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e4effa",
        class: ""
      },
      subContent: []
    },

    // Reitit
    {
      name: "Varsinais-Suomen virkistysreitit",
      id: null,
      type: "virtual",
      visible: true,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e4effa",
        class: ""
      },
      subContent: [
        {
          name: "Luontopolku",
          id: 1300,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#369830"
          }
        },
        {
          name: "Matkailureitti",
          id: 1301,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#d9500b"
          }
        },
        {
          name: "Melontareitti",
          id: 1302,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#607aea"
          }
        },
        {
          name: "Pyöräilyreitti",
          id: 1303,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#ff0000"
          }
        },
        {
          name: "Retkeilyreitti",
          id: 1304,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#00be8c"
          }
        },
        {
          name: "Retkilatu",
          id: 1305,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#41e3e3"
          }
        },
        {
          name: "Kuntoreitti",
          id: 1307,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#2915fc"
          }
        },
        {
          name: "Kulttuuriulkoilureitti",
          id: 1306,
          type: "wms",
          visible: true,
          checked: true,
          renderAs: "checkbox",
          legend: {
            icon: "route",
            color: "#fdbf6f"
          }
        }
      ]
    },

    // Pyörätiet
    {
      name: "Turun seudun pyörätiet",
      id: 1202,
      type: "wms",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e4effa",
        class: ""
      },
      subContent: []
    },

    // Kuhankuono
    {
      name: "Kuhankuonon retkeilyreitistö",
      id: 226,
      type: "wms",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e4effa",
        class: ""
      },
      subContent: []
    }

    // Muut
    // {
    //   name: "Muut",
    //   id: null,
    //   type: "virtual",
    //   visible: false,
    //   checked: null,
    //   renderAs: "accordion",
    //   style: {
    //     backgroundColor: "#e6e8dd",
    //     class: ""
    //   },
    //   subContent: [
    //     {
    //       name: "Turun pyörätiet",
    //       id: 1202,
    //       type: "wms",
    //       visible: false,
    //       checked: false,
    //       renderAs: "checkbox"
    //     }
    //   ]
    // }

    // {
    //   name: "Luontopolut",
    //   id: 1300,
    //   type: "wms",
    //   visible: true,
    //   renderAs: "accordion",
    //   style: {
    //     backgroundColor: "#edf5ce"
    //   },
    //   subContent: []
    //   // if renderAs="accordion" && subcontent empty, don't render open-arrow
    // },
    // {
    //   name: "WMS + text accordion",
    //   id: null,
    //   type: "virtual",
    //   visible: false,
    //   renderAs: "accordion",
    //   style: {
    //     backgroundColor: "#edf5ce"
    //   },
    //   subContent: [
    //     {
    //       name: "OpenStreetMap",
    //       id: 329,
    //       type: "wms",
    //       visible: true,
    //       checked: true,
    //       renderAs: "checkbox"
    //     },
    //     {
    //       name: "<a>Text content in link tag</a>",
    //       id: null,
    //       type: "text",
    //       visible: true,
    //       renderAs: "text" // olisko eroteltu text ja html?
    //     }
    //   ]
    // },
    // {
    //   name: "Kuntoradat",
    //   id: 1301,
    //   type: "wms",
    //   visible: true,
    //   renderAs: "accordion",
    //   style: {
    //     backgroundColor: "#edf5ce"
    //   },
    //   subContent: [
    //     {
    //       name: "<a href=''>Hae yksittäiset reitit</a>", // vai emitoi eventti joka ottaa address-attribuutin ja kutsuu funktiota
    //       id: null,
    //       type: "text",
    //       visible: true,
    //       renderAs: "text"
    //     }
    //   ],
    //   alternativeContent: [
    //     // olisko jotain tällaista ratkaisu wmf <-> wfs ongelmaan
    //     {
    //       name: "Turku",
    //       id: "",
    //       type: "wfs-layer", // miten oskarin funktiot oli? onko eroa siinä onko layer vai feature?
    //       visible: true,
    //       renderAs: "accordion",
    //       subContent: [
    //         {
    //           name: "Rääkkipolku",
    //           id: "",
    //           type: "wfs-feature",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         },
    //         {
    //           name: "Jokupolku",
    //           id: "",
    //           type: "wfs-feature",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   name: "Matkailureitti",
    //   id: null,
    //   type: "virtual",
    //   visible: true,
    //   renderAs: "accordion",
    //   style: {
    //     backgroundColor: "#edf5ce"
    //   },
    //   subContent: [
    //     {
    //       // Tämä on virtual layer (ei WMS eikä itse luotu, vain renderöintiä varten)
    //       name: "Turku",
    //       id: null,
    //       type: "virtual",
    //       visible: true,
    //       renderAs: "accordion",
    //       subContent: [
    //         {
    //           name: "Feature 1",
    //           id: "1302",
    //           type: "wms",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         },
    //         {
    //           name: "Feature 2",
    //           id: "1303",
    //           type: "wms",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         }
    //       ]
    //     },
    //     {
    //       name: "Kaarina",
    //       id: null,
    //       type: "virtual",
    //       visible: true,
    //       renderAs: "accordion",
    //       subContent: [
    //         {
    //           name: "Feature 3",
    //           id: "1302",
    //           type: "wms",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         },
    //         {
    //           name: "Feature 4",
    //           id: "1303",
    //           type: "wms",
    //           visible: true,
    //           checked: true,
    //           renderAs: "checkbox"
    //         }
    //       ]
    //     }
    //   ]
    // }
  ]
};