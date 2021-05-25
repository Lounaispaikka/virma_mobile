# Virma Kartta

https://kartta.virma.fi


### What is this about:

The project is a webmap-application for visualizing and using open Virma-data.

It is coded with Vue.js, Vuetify and Javascript and it uses OskariRPC-framework/functionality to communicate with backend Geoserver.


### Basic developer flow:

Clone the repository\
Install dependencies: `npm install`\
Run dev-server with compile and hot reload: `npm run serve`\
Make your edits\
Build production version (compile and minify): `npm run build`\
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


### Some specific update situations

For all situations, first see section 'Basic developer flow'.

##### Add new map layer without expandable sub-layers (like 'Varsinais-Suomen Virkistyskohteet')

1. Add new layer in Karttapaikka into Karttaupotus

2. Open file '/src/config.js'  
3. Find object 'layersMenuContent'  
Attribute 'layers' holds an array of objects = items in layers-menu, so this is where you should add new item.  
4. Copy an existing object in array (like 'Varsinais-Suomen Virkistyskohteet')  
5. Add the copied object into right position (items are in same order as in layers-menu)  
Remember to use commas to separate array objects and save the file when modified...  

6. Fill the name (= the name shown in layers menu) and id (= layer id in 'Karttaupotus')  
To find out the id of new layer:  
Change logLayerInfoToConsole to True (in config.js:layersMenuContent)  
Run development server: `npm run serve` (in project root where package.json is)  
The layers are logged in browser dev-tools console  
Check that menu is looking and working right with newly added item  
Change logLayerInfoToConsole back to False  
Stop development server with Ctrl-C  

7. Build distribution version: `npm run build` (in project root where package.json is)  
8. Publish /dist folder to web-server  
9. Done!


##### Add new map layer with expandable sub-layers (like 'Varsinais-Suomen Virkistysreitit')

This works exactly the same way as above, except that:  
- the 'type' attribute in layersMenuContent-object is 'virtual'  
- the actual wms-layers (in 'Karttaupotus') are objects in subContent-array.  
(copy and modify existing one, like 'Varsinais-Suomen Virkistysreitit')


##### Change the URL-address of 'Karttaupotus'

1. Open file '/src/config.js'  
2. Change the URL in mapConfig:mapAddress 
3. Save the file... 
4. Build distribution version: `npm run build` (in project root where package.json is)  
5. Publish /dist folder to web-server  



##### Modify the search-functionality

The search works with Geoserver CQL-filters. You can modify the search queries by:  
1. Open file '/src/config.js'  
2. Modify the queries in searchConfig:CQLFilters  
3. Save the file...
4. Build distribution version: `npm run build` (in project root where package.json is)  
5. Publish /dist folder to web-server  



##### Add new content to welcome-dialog  

1. Open file '/src/config.js'  
2. Modify the content in welcomeContent:items  
3. Save the file...
4. Build distribution version: `npm run build` (in project root where package.json is)  
5. Publish /dist folder to web-server  



##### Add new route or point type (like 'Maastopyöräreitti')

First make all needed modifications in database (and Virma Ylläpito).  
After that, add new layer like above (either as single layer or in 'subContent').  
Then you also have to add new type into search form options:

1. Open file '/src/config.js'  
2. Add new route type to searchConfig:routeTypes and new point type to searchConfig:pointTypes
3. You propably also want to add new type to help-dialogs mapsymbols-tab -> see next section
4. Save the file...
5. Build distribution version: `npm run build` (in project root where package.json is)  
6. Publish /dist folder to web-server 




##### Modify map-symbols in help-dialog

1. Open file '/src/config.js'  
2. Modify the content in one of the
- helpDialogSymbols:routes
- helpDialogSymbols:pointsRecreation
- helpDialogSymbols:pointsTravel  

3. Save the file...
4. Build distribution version: `npm run build` (in project root where package.json is)  
5. Publish /dist folder to web-server



##### Add new background map

Background maps are same kind of layers in 'Karttaupotus' as all the other layers, so read corresponding sections above, but add background map layer to config.js:backGroundMaps:layers instead.