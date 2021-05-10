# Virma Kartta

https://kartta.virma.fi


### What is this about:

The project is a webmap-application for visualizing and using open Virma-data.

It is coded with Vue.js, Vuetify and Javascript and it uses OskariRPC-framework/functionality to communicate with backend Geoserver.


### Basic developer flow:

Clone the repository

Install dependencies: '''npm install'''

Run dev-server with compile and hot reload: '''npm run serve'''

Make your edits

Build production version (compile and minify): '''npm run build''''

Publish /dist somehow - rsync for example, or build some fancy pipeline :)


### Some things to know to give general understanding of the code:

Geographical information (as well ad Geoserver and backend database) has concepts of (multi)linestrings and points.

In the application there is often code/methods/variables which have the same distinction to routes (lines) and places (points).

The map itself is wms-raster published as 'karttaupotus' in Lounaistieto Karttapalvelu and it is served by OskariRPC.

In addition the application uses OskariRPC vector layers / vector features to represent search results and location indicator.

Search function uses CQL-filter-queries to get (vector)features from Geoserver.


### More specific about code:

The code is obviously constructed using Vue:s structure (template-script-style) but it is not divided into single file components.

From the pespective of maintenance, basically all necessery code is in src/App.vue and src/config.js. Static files are in src/assets. 

The application starts from mounted and created -methods and moves on to initOskariChannel-method.

The layers-menu is constructed in the application initialization from wms-layers coming from Karttapalvelu.

Wms-layers have id:s which map to menu-layers. Wms-layers and their id:s are printed to console when logLayerInfoToConsole is set to true in config.js

Application uses browsers Geolocation api for ... well, geolocation... instead of OskariRPC and proj4.js is used for coordinate conversion (WGS84 -> EPSG:3067)

Application uses url-hashes for internal navigation (search-dialog, help-dialog etc) because this enables the use of browsers back-button.

Note that in template-section of Vue.app there are two html-templates for layers-menu-dialog because in desktop layers-menu is always present and it is without url-hash.

Config.js has variables for url-address of the map (karttaupotus) and Geoserver-layers which are used by search-function.

These are the first ones to check if the application (or search) is not responding (and general server (web- and Geoserver) state of course...)


### Links:

Vue.js: [https://www.vue.js](https://www.vue.js)

Vuetify: [https://www.vuetifyjs.com](https://www.vuetifyjs.com)

OskariRPC: [https://www.oskari.org/documentation](https://www.oskari.org/documentation) -> Using a hosted Oskari - RPC

Geoserver CQL-filters: [https://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html](https://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html)
