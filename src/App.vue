<template>
  <v-app id="inspire">
    <v-app-bar
      clipped-left
      fixed
      app
      color="#627f9a"
      dark
      :bottom="$vuetify.breakpoint.xsOnly"
    >
      <!-- <v-app-bar-nav-icon
        class="d-none d-sm-flex"
        @click.stop="drawer = !drawer"
      /> -->
      <v-img
        class="mx-2 d-none d-sm-inline"
        src="@/assets/virma_logo_green.png"
        max-height="50"
        max-width="100"
        contain
      ></v-img>
      <v-toolbar-title class="d-none d-md-flex" style="overflow:visible;"
        >Kartta</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <!-- TODO add tooltip -->
      <span
        style="width:100%; max-width:500px;"
        class="d-flex justify-space-around"
      >
        <v-btn icon large @click.stop="toggleDialog('search', true)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <!-- <v-spacer></v-spacer> -->

        <!-- TODO add tooltip -->
        <v-btn
          v-if="!$vuetify.breakpoint.mobile"
          icon
          large
          @click.stop="dialogLayers = !dialogLayers"
        >
          <v-icon>mdi-layers-triple</v-icon>
        </v-btn>

        <v-btn
          v-else
          icon
          large
          @click.stop="toggleDialog('layers', true)"
        >
          <v-icon>mdi-layers-triple</v-icon>
        </v-btn>
        <!-- <v-spacer></v-spacer> -->

        <v-btn icon large @click="toggleFullScreen">
          <v-icon>mdi-overscan</v-icon>
        </v-btn>

        <v-btn icon large @click.stop="toggleDialog('help', true)">
          <v-icon>mdi-help</v-icon>
        </v-btn>
      </span>

      <!-- <v-menu left bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="n in 5" :key="n" @click="() => {}">
            <v-list-item-title>Option {{ n }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main class="pt-0 pt-sm-14 pt-md-16 pb-14 pb-sm-0">
      <!-- v-main padding is for fixing Vues 'lazy' reacting for window resize -->
      <v-container class="fill-height" fluid>
        <div style="position: absolute; bottom: 16px; right: 0; z-index: 1;">
          <v-row justify="end" class="ma-0">
            <v-col class="pr-1 pr-sm-3 mb-6">
              <!-- TODO add tooltip -->
              <!-- TODO remove this comment if color scheme ok. Old color: 'darken-1' -->
              <v-btn
                fab
                class="mb-2 no-blur"
                :color="keepMapCenteredToPosition ? 'success' : '#627f9a'"
                dark
                style="display: block;"
                @click="keepMapCenteredToPosition = !keepMapCenteredToPosition"
              >
                <v-icon>mdi-image-filter-center-focus</v-icon>
                <!-- <v-icon>map-marker-path</v-icon> -->
                <!-- <v-icon>vector-point</v-icon> -->
              </v-btn>

              <!-- TODO add tooltip -->
              <v-btn
                fab
                class="mb-2 no-blur"
                :color="showPosition.status ? 'success' : '#627f9a'"
                dark
                style="display: block;"
                @click="
                  showPosition.status = !showPosition.status;
                  toggleShowAndUpdatePosition();
                "
              >
                <v-icon>mdi-crosshairs-gps</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-row align="center" justify="center">
          <v-col class="text-center">
            <div>
              <iframe
                id="map"
                :src="mapSrc"
                allow="geolocation"
                style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden;"
              ></iframe>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Layers-dialog Desktop -->
    <!-- src="@/assets/Hierkonpolku_DSC_9195_Terhi Ajosenpää_800px.jpg" -->
    <template v-if="!$vuetify.breakpoint.mobile">
      <v-navigation-drawer
        v-model="dialogLayers"
        clipped
        app
        width="430"
        class="pr-2 pt-2"
      >
        <template v-if="!renderStructureTEST.layersLoaded">
          <div class="text-center">
            <h4 class="mb-4">Karttatasoja haetaan</h4>
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>

        <template v-else>
          <!-- Selected search results -->
          <template>
            <v-expansion-panels class="mb-4 ml-2">
              <v-expansion-panel style="backgroundColor: #eedbad;">
                <v-expansion-panel-header class="my-0 py-0">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row>
                      <v-col cols="10">
                        <!-- v-model="layer.visible" -->
                        <v-checkbox
                          @click.native.stop
                          @change="toggleVisibilityOfSearchResults"
                          v-model="selectedSearchResultLayers.visible"
                          on-icon="mdi-eye"
                          off-icon="mdi-eye-off"
                          class="my-0 py-0"
                          style="height: 20px;"
                          ><template v-slot:label>
                            <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 250px;"
                            >
                              Hakutulokset (
                              {{
                                selectedSearchResultLayers.selectedPoints
                                  .length +
                                  selectedSearchResultLayers
                                    .selectedRoutes.length
                              }}
                              )
                            </span>
                          </template>
                        </v-checkbox>
                      </v-col>
                      <!-- <v-col
                        cols="2"
                        class="text-right pr-4"
                        style="line-height:24px;"
                        >1/3</v-col
                      > -->
                      <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                    </v-row>
                  </v-container>
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <template v-if="!hasSelectedFeaturesInLayersMenu">
                    <div class="pl-8">
                      Ei tuloksia, käytä Hakutoimintoa
                      <v-btn
                        color="#627f9a"
                        dark
                        fab
                        small
                        depressed
                        class="mx-2"
                        @click.stop="toggleDialog('search', true)"
                        ><v-icon>mdi-magnify</v-icon></v-btn
                      >
                      ja valitse "Näytä valitut kartalla"
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-for="pointItem in selectedSearchResultLayers.selectedPoints"
                      :key="pointItem.id"
                      max-width="100%"
                      class="ml-4 mt-0 py-0"
                    >
                      <v-checkbox
                        v-model="pointItem.checked"
                        @change="toggleCheckedSearchResult(pointItem)"
                        class="ml-4 mt-0 py-0"
                        ><template v-slot:label>
                          <div>{{ pointItem.properties.name_fi }}</div>
                        </template>
                      </v-checkbox>
                    </div>

                    <div
                      v-for="routeItem in selectedSearchResultLayers.selectedRoutes"
                      :key="routeItem.id"
                      max-width="100%"
                      class="ml-4 mt-0 py-0"
                    >
                      <v-checkbox
                        v-model="routeItem.checked"
                        @change="toggleCheckedSearchResult(routeItem)"
                        class="ml-4 mt-0 py-0"
                        ><template v-slot:label>
                          <div>{{ routeItem.properties.name_fi }}</div>
                        </template>
                      </v-checkbox>
                    </div>
                  </template>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
          <!-- Menu-layers -->
          <v-expansion-panels
            class="mb-4 ml-2"
            v-model="renderStructureTEST.openOnStartUp"
            multiple
          >
            <!-- Level 0 -->
            <v-expansion-panel
              v-for="(layer, i) in renderStructureTEST.layers"
              :key="i"
              :style="layer.style"
              :class="layer.style.class"
            >
              <v-expansion-panel-header
                :expand-icon="
                  layer.subContent.length == 0 ? '' : undefined
                "
                :disabled="layer.subContent.length == 0 ? true : false"
                class="my-0 py-0"
              >
                <v-container fluid class="ma-0 pa-0">
                  <v-row>
                    <v-col cols="10">
                      <v-checkbox
                        @click.native.stop
                        @change="toggleVisibility(layer)"
                        v-model="layer.visible"
                        on-icon="mdi-eye"
                        off-icon="mdi-eye-off"
                        class="my-0 py-0"
                        style="height: 20px;"
                        ><template v-slot:label>
                          <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                          <span
                            class="d-inline-block text-truncate"
                            style="max-width: 350px;"
                          >
                            {{ layer.name }}
                          </span>
                        </template>
                      </v-checkbox>
                    </v-col>
                    <!-- <v-col
                      cols="2"
                      class="text-right pr-4"
                      style="line-height:24px;"
                      >1/3</v-col
                    > -->
                    <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                  </v-row>
                </v-container>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <div
                  v-for="(item, i) in layer.subContent"
                  :key="i"
                  max-width="100%"
                  class="ml-4 mt-0 py-0"
                >
                  <v-checkbox
                    v-if="item.renderAs == 'checkbox'"
                    v-model="item.checked"
                    @change="toggleChecked(item)"
                    class="ml-4 mt-0 py-0"
                  >
                    <template v-slot:label>
                      <div>
                        {{ item.name }}
                      </div>
                    </template>

                    <template v-slot:append>
                      <v-img
                        v-if="item.hasOwnProperty('legend')"
                        :src="
                          item.legend.imageName.length == 0
                            ? ''
                            : require(`@/assets/mapsymbols/${item.legend.imageName}`)
                        "
                        :alt="item.name"
                        max-width="40px"
                        max-height="40px"
                        class=""
                      ></v-img>
                    </template>
                  </v-checkbox>

                  <template v-else-if="item.renderAs == 'accordion'">
                    <!-- Level 1 -->
                    <v-expansion-panels>
                      <v-expansion-panel>
                        <v-expansion-panel-header
                          :expand-icon="
                            item.subContent.length == 0 ? '' : undefined
                          "
                          :disabled="
                            item.subContent.length == 0 ? true : false
                          "
                          class="my-0 py-0"
                        >
                          <v-container fluid class="ma-0 pa-0">
                            <v-row>
                              <v-col cols="10">
                                <v-checkbox
                                  @click.native.stop
                                  @change="toggleVisibility(item)"
                                  v-model="item.visible"
                                  on-icon="mdi-eye"
                                  off-icon="mdi-eye-off"
                                  class="my-0 py-0"
                                  style="height: 20px;"
                                  ><template v-slot:label>
                                    <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px;"
                                    >
                                      {{ item.name }}
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
                              <!-- <v-col cols="2" class="text-right" style="line-height:24px;">1/3</v-col> -->
                              <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                            </v-row>
                          </v-container>
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                          <!-- Level 2 -->
                          <div
                            v-for="(subItem, i) in item.subContent"
                            :key="i"
                            max-width="100%"
                            class="ml-4 mt-0 py-0"
                          >
                            <v-checkbox
                              v-if="subItem.renderAs == 'checkbox'"
                              v-model="subItem.checked"
                              @change="toggleChecked(subItem)"
                              class="ml-4 mt-0 py-0"
                            >
                              <template v-slot:label>
                                <div>
                                  {{ subItem.name }}
                                </div>
                              </template>

                              <template v-slot:append>
                                <v-img
                                  v-if="subItem.hasOwnProperty('legend')"
                                  :src="
                                    subItem.legend.imageName.length == 0
                                      ? ''
                                      : require(`@/assets/mapsymbols/${subItem.legend.imageName}`)
                                  "
                                  :alt="subItem.name"
                                  max-width="40px"
                                  max-height="40px"
                                  class=""
                                ></v-img>
                              </template>
                            </v-checkbox>

                            <!-- Level 3 if needed -->
                            <!-- <template
                              v-else-if="subItem.renderAs == 'accordion'"
                            >
                              <v-expansion-panels>
                                <v-expansion-panel>
                                  <v-expansion-panel-header>
                                    {{ subItem.name }}
                                  </v-expansion-panel-header>
                                  <v-expansion-panel-content
                                    max-width="100%"
                                  >
                                    <v-checkbox
                                      v-for="(item, i) in 5"
                                      :key="i"
                                      :label="i + 1 + '. polku'"
                                      checked
                                      dense
                                      class="ml-4 mt-0 pt-0"
                                    ></v-checkbox>
                                  </v-expansion-panel-content>
                                </v-expansion-panel>
                              </v-expansion-panels>
                            </template> -->

                            <template
                              v-else-if="subItem.renderAs == 'text'"
                            >
                              <p class="text-center">
                                <span v-html="subItem.name"></span>
                              </p>
                            </template>
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </template>

                  <template v-else-if="item.renderAs == 'text'">
                    <p class="text-center">
                      <span v-html="item.name"></span>
                    </p>
                  </template>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Backgroundmaps -->
          <template>
            <v-expansion-panels
              class="mb-4 ml-2"
              v-model="backGroundMaps.openOnStartUp"
              multiple
            >
              <v-expansion-panel style="backgroundColor: #f7f7f7;">
                <v-expansion-panel-header class="my-0 py-0">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row>
                      <v-col cols="10">
                        <v-checkbox
                          @click.native.stop
                          @change="toggleBackgroundMaps"
                          v-model="backGroundMaps.visible"
                          on-icon="mdi-eye"
                          off-icon="mdi-eye-off"
                          class="my-0 py-0"
                          style="height: 20px;"
                          ><template v-slot:label>
                            <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 250px;"
                            >
                              Taustakartat
                            </span>
                          </template>
                        </v-checkbox>
                      </v-col>
                      <!-- <v-col
                        cols="2"
                        class="text-right pr-4"
                        style="line-height:24px;"
                        >1/3</v-col
                      > -->
                      <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                    </v-row>
                  </v-container>
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <template>
                    <v-radio-group
                      v-model="backGroundMaps.selected"
                      :mandatory="true"
                      class="mt-0"
                      @change="toggleBackgroundMaps"
                    >
                      <div
                        v-for="item in backGroundMaps.layers"
                        :key="item.id"
                        max-width="100%"
                        class="ml-4 pl-4 mt-0 pb-4"
                      >
                        <v-radio
                          :label="item.name"
                          :value="item.id"
                        ></v-radio>
                      </div>
                    </v-radio-group>
                  </template>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </template>
      </v-navigation-drawer>
    </template>

    <!-- Layers-dialog Mobile -->
    <template v-else>
      <v-dialog
        v-model="dialogLayers"
        persistent
        scrollable
        max-width="700"
        :fullscreen="$vuetify.breakpoint.xsOnly"
      >
        <!--
        :retain-focus="false" for fixing Uncaught RangeError: Maximum call stack size exceeded.
        https://forum.vuejs.org/t/too-much-recursion-maximum-call-stack-size-exceeded/66277/4
        https://github.com/vuetifyjs/vuetify/issues/8459
          -->

        <v-card
          style="min-width:350px;"
          :min-height="
            $vuetify.breakpoint.smAndUp ? $vuetify.breakpoint.height - 200 : ''
          "
        >
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>Kartalla näkyvät tasot</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click.stop="closeDialog('layers')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-row justify="center" class="mx-0">
              <v-card width="100%" max-width="650px" flat class="ma-2">
                <template v-if="!renderStructureTEST.layersLoaded">
                  <div class="text-center">
                    <h4 class="mb-4">Karttatasoja haetaan</h4>
                    <v-progress-circular
                      :size="50"
                      color="primary"
                      indeterminate
                    ></v-progress-circular>
                  </div>
                </template>

                <template v-else>
                  <!-- Selected search results -->
                  <template>
                    <v-expansion-panels class="mb-4">
                      <v-expansion-panel style="backgroundColor: #eedbad;">
                        <v-expansion-panel-header class="my-0 py-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-row>
                              <v-col cols="10">
                                <!-- v-model="layer.visible" -->
                                <v-checkbox
                                  @click.native.stop
                                  @change="toggleVisibilityOfSearchResults"
                                  v-model="selectedSearchResultLayers.visible"
                                  on-icon="mdi-eye"
                                  off-icon="mdi-eye-off"
                                  class="my-0 py-0"
                                  style="height: 20px;"
                                  ><template v-slot:label>
                                    <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px;"
                                    >
                                      Hakutulokset (
                                      {{
                                        selectedSearchResultLayers.selectedPoints
                                          .length +
                                          selectedSearchResultLayers
                                            .selectedRoutes.length
                                      }}
                                      )
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
                              <!-- <v-col
                                cols="2"
                                class="text-right pr-4"
                                style="line-height:24px;"
                                >1/3</v-col
                              > -->
                              <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                            </v-row>
                          </v-container>
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                          <template v-if="!hasSelectedFeaturesInLayersMenu">
                            <div class="pl-8">
                              Ei tuloksia, käytä Hakutoimintoa
                              <v-btn
                                color="#627f9a"
                                dark
                                fab
                                small
                                depressed
                                class="mx-2"
                                @click="
                                  {
                                    toggleDialog('layers', false);
                                    toggleDialog('search', true);
                                  }
                                "
                                ><v-icon>mdi-magnify</v-icon></v-btn
                              >
                              ja valitse "Näytä valitut kartalla"
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="pointItem in selectedSearchResultLayers.selectedPoints"
                              :key="pointItem.id"
                              max-width="100%"
                              class="ml-4 mt-0 py-0"
                            >
                              <v-checkbox
                                v-model="pointItem.checked"
                                @change="toggleCheckedSearchResult(pointItem)"
                                class="ml-4 mt-0 py-0"
                                ><template v-slot:label>
                                  <div>{{ pointItem.properties.name_fi }}</div>
                                </template>
                              </v-checkbox>
                            </div>

                            <div
                              v-for="routeItem in selectedSearchResultLayers.selectedRoutes"
                              :key="routeItem.id"
                              max-width="100%"
                              class="ml-4 mt-0 py-0"
                            >
                              <v-checkbox
                                v-model="routeItem.checked"
                                @change="toggleCheckedSearchResult(routeItem)"
                                class="ml-4 mt-0 py-0"
                                ><template v-slot:label>
                                  <div>{{ routeItem.properties.name_fi }}</div>
                                </template>
                              </v-checkbox>
                            </div>
                          </template>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </template>
                  <!-- Menu-layers -->
                  <v-expansion-panels
                    class="mb-4"
                    v-model="renderStructureTEST.openOnStartUp"
                    multiple
                  >
                    <!-- Level 0 -->
                    <v-expansion-panel
                      v-for="(layer, i) in renderStructureTEST.layers"
                      :key="i"
                      :style="layer.style"
                      :class="layer.style.class"
                    >
                      <v-expansion-panel-header
                        :expand-icon="
                          layer.subContent.length == 0 ? '' : undefined
                        "
                        :disabled="layer.subContent.length == 0 ? true : false"
                        class="my-0 py-0"
                      >
                        <v-container fluid class="ma-0 pa-0">
                          <v-row>
                            <v-col cols="10">
                              <v-checkbox
                                @click.native.stop
                                @change="toggleVisibility(layer)"
                                v-model="layer.visible"
                                on-icon="mdi-eye"
                                off-icon="mdi-eye-off"
                                class="my-0 py-0"
                                style="height: 20px;"
                                ><template v-slot:label>
                                  <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                                  <span
                                    class="d-inline-block text-truncate"
                                    style="max-width: 350px;"
                                  >
                                    {{ layer.name }}
                                  </span>
                                </template>
                              </v-checkbox>
                            </v-col>
                            <!-- <v-col
                              cols="2"
                              class="text-right pr-4"
                              style="line-height:24px;"
                              >1/3</v-col
                            > -->
                            <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                          </v-row>
                        </v-container>
                      </v-expansion-panel-header>

                      <v-expansion-panel-content>
                        <div
                          v-for="(item, i) in layer.subContent"
                          :key="i"
                          max-width="100%"
                          class="ml-4 mt-0 py-0"
                        >
                          <v-checkbox
                            v-if="item.renderAs == 'checkbox'"
                            v-model="item.checked"
                            @change="toggleChecked(item)"
                            class="ml-4 mt-0 py-0"
                          >
                            <template v-slot:label>
                              <div>
                                {{ item.name }}
                              </div>
                            </template>

                            <template v-slot:append>
                              <v-img
                                v-if="item.hasOwnProperty('legend')"
                                :src="
                                  item.legend.imageName.length == 0
                                    ? ''
                                    : require(`@/assets/mapsymbols/${item.legend.imageName}`)
                                "
                                :alt="item.name"
                                max-width="40px"
                                max-height="40px"
                                class=""
                              ></v-img>
                            </template>
                          </v-checkbox>

                          <template v-else-if="item.renderAs == 'accordion'">
                            <!-- Level 1 -->
                            <v-expansion-panels>
                              <v-expansion-panel>
                                <v-expansion-panel-header
                                  :expand-icon="
                                    item.subContent.length == 0 ? '' : undefined
                                  "
                                  :disabled="
                                    item.subContent.length == 0 ? true : false
                                  "
                                  class="my-0 py-0"
                                >
                                  <v-container fluid class="ma-0 pa-0">
                                    <v-row>
                                      <v-col cols="10">
                                        <v-checkbox
                                          @click.native.stop
                                          @change="toggleVisibility(item)"
                                          v-model="item.visible"
                                          on-icon="mdi-eye"
                                          off-icon="mdi-eye-off"
                                          class="my-0 py-0"
                                          style="height: 20px;"
                                          ><template v-slot:label>
                                            <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                                            <span
                                              class="d-inline-block text-truncate"
                                              style="max-width: 250px;"
                                            >
                                              {{ item.name }}
                                            </span>
                                          </template>
                                        </v-checkbox>
                                      </v-col>
                                      <!-- <v-col cols="2" class="text-right" style="line-height:24px;">1/3</v-col> -->
                                      <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                                    </v-row>
                                  </v-container>
                                </v-expansion-panel-header>

                                <v-expansion-panel-content>
                                  <!-- Level 2 -->
                                  <div
                                    v-for="(subItem, i) in item.subContent"
                                    :key="i"
                                    max-width="100%"
                                    class="ml-4 mt-0 py-0"
                                  >
                                    <v-checkbox
                                      v-if="subItem.renderAs == 'checkbox'"
                                      v-model="subItem.checked"
                                      @change="toggleChecked(subItem)"
                                      class="ml-4 mt-0 py-0"
                                    >
                                      <template v-slot:label>
                                        <div>
                                          {{ subItem.name }}
                                        </div>
                                      </template>

                                      <template v-slot:append>
                                        <v-img
                                          v-if="subItem.hasOwnProperty('legend')"
                                          :src="
                                            subItem.legend.imageName.length == 0
                                              ? ''
                                              : require(`@/assets/mapsymbols/${subItem.legend.imageName}`)
                                          "
                                          :alt="subItem.name"
                                          max-width="40px"
                                          max-height="40px"
                                          class=""
                                        ></v-img>
                                      </template>
                                    </v-checkbox>

                                    <!-- Level 3 if needed -->
                                    <!-- <template
                                      v-else-if="subItem.renderAs == 'accordion'"
                                    >
                                      <v-expansion-panels>
                                        <v-expansion-panel>
                                          <v-expansion-panel-header>
                                            {{ subItem.name }}
                                          </v-expansion-panel-header>
                                          <v-expansion-panel-content
                                            max-width="100%"
                                          >
                                            <v-checkbox
                                              v-for="(item, i) in 5"
                                              :key="i"
                                              :label="i + 1 + '. polku'"
                                              checked
                                              dense
                                              class="ml-4 mt-0 pt-0"
                                            ></v-checkbox>
                                          </v-expansion-panel-content>
                                        </v-expansion-panel>
                                      </v-expansion-panels>
                                    </template> -->

                                    <template
                                      v-else-if="subItem.renderAs == 'text'"
                                    >
                                      <p class="text-center">
                                        <span v-html="subItem.name"></span>
                                      </p>
                                    </template>
                                  </div>
                                </v-expansion-panel-content>
                              </v-expansion-panel>
                            </v-expansion-panels>
                          </template>

                          <template v-else-if="item.renderAs == 'text'">
                            <p class="text-center">
                              <span v-html="item.name"></span>
                            </p>
                          </template>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <!-- Backgroundmaps -->
                  <template>
                    <v-expansion-panels
                      class="mb-4"
                      v-model="backGroundMaps.openOnStartUp"
                      multiple
                    >
                      <v-expansion-panel style="backgroundColor: #f7f7f7;">
                        <v-expansion-panel-header class="my-0 py-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-row>
                              <v-col cols="10">
                                <v-checkbox
                                  @click.native.stop
                                  @change="toggleBackgroundMaps"
                                  v-model="backGroundMaps.visible"
                                  on-icon="mdi-eye"
                                  off-icon="mdi-eye-off"
                                  class="my-0 py-0"
                                  style="height: 20px;"
                                  ><template v-slot:label>
                                    <!-- TODO set max-width to somehow fill cols-10 without set px:s -->
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px;"
                                    >
                                      Taustakartat
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
                              <!-- <v-col
                                cols="2"
                                class="text-right pr-4"
                                style="line-height:24px;"
                                >1/3</v-col
                              > -->
                              <!-- TODO text color same as label text, count real numbers instead of this placeholder... -->
                            </v-row>
                          </v-container>
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                          <template>
                            <v-radio-group
                              v-model="backGroundMaps.selected"
                              :mandatory="true"
                              class="mt-0"
                              @change="toggleBackgroundMaps"
                            >
                              <div
                                v-for="item in backGroundMaps.layers"
                                :key="item.id"
                                max-width="100%"
                                class="ml-4 pl-4 mt-0 pb-4"
                              >
                                <v-radio
                                  :label="item.name"
                                  :value="item.id"
                                ></v-radio>
                              </div>
                            </v-radio-group>
                          </template>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </template>
                </template>
              </v-card>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Search-dialog -->
    <template>
      <v-dialog
        v-model="dialogSearch"
        persistent
        scrollable
        max-width="1600px"
        :fullscreen="$vuetify.breakpoint.xsOnly"
      >
        <v-card style="min-width:350px;">
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>Hae reittejä ja kohteita</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click.stop="closeDialog('search')">
              <v-icon>mdi-close</v-icon>
            </v-btn>

            <template v-slot:extension>
              <v-tabs
                v-model="dialogSearchTabs"
                background-color="#627f9a"
                dark
                centered
              >
                <v-tab>Haku</v-tab>
                <v-tab
                  >Hakutulokset (
                  {{
                    searchResults.points.objects.length +
                      searchResults.routes.objects.length
                  }}
                  )</v-tab
                >
              </v-tabs>
            </template>
          </v-toolbar>
          <v-card-text>
            <v-tabs-items v-model="dialogSearchTabs">
              <!-- Search options -->
              <v-tab-item class="py-4">
                <v-row justify="center" class="mx-0">
                  <v-card
                    width="100%"
                    max-width="650px"
                    flat
                    class="ma-2"
                    :min-height="
                      $vuetify.breakpoint.smAndUp
                        ? $vuetify.breakpoint.height - 300
                        : ''
                    "
                  >
                    <v-container>
                      <template v-if="!renderStructureTEST.layersLoaded">
                        <div class="text-center">
                          <h4 class="mb-4">Karttatasoja haetaan</h4>
                          <v-progress-circular
                            :size="50"
                            color="primary"
                            indeterminate
                          ></v-progress-circular>
                        </div>
                      </template>

                      <template v-else>
                        <v-form ref="searchForm">
                          <v-text-field
                            v-model="searchOptions.searchText"
                            hint="Esim. Kurjenrahka"
                            label="Vapaasanahaku"
                            clearable
                            outlined
                            class="mb-2"
                          ></v-text-field>

                          <v-select
                            v-model="searchOptions.selectedRouteOrPoint"
                            :items="searchOptions.routeOrPoint"
                            :menu-props="{ bottom: true, offsetY: true }"
                            label="Reitti / Kohde"
                            multiple
                            outlined
                            style="min-height: 48px;"
                            hint="placeholder for v-slot:message"
                          >
                            <template v-slot:selection="{ item }">
                              <v-chip>
                                <span>{{ item }}</span>
                              </v-chip>
                            </template>
                            <template v-slot:message>
                              <span
                                >Rajoita haku vain valittuihin<br />
                                (jos et rajoita hakua niin etsitään kaikista
                                reiteistä ja kohteista)</span
                              >
                            </template>
                          </v-select>

                          <v-select
                            v-if="
                              searchOptions.selectedRouteOrPoint.length == 0 ||
                                searchOptions.selectedRouteOrPoint.includes(
                                  'Reitti'
                                )
                            "
                            v-model="searchOptions.selectedRouteTypes"
                            :items="searchOptions.routeTypes"
                            :menu-props="{ bottom: true, offsetY: true }"
                            label="Reittityyppi"
                            multiple
                            outlined
                            style="min-height: 48px;"
                            hint="placeholder for v-slot:message"
                            class="mb-2"
                          >
                            <template v-slot:selection="{ item, index }">
                              <v-chip v-if="index === 0">
                                <span>{{ item }}</span>
                              </v-chip>
                              <span
                                v-if="index === 1"
                                class="grey--text caption"
                                >(+{{
                                  searchOptions.selectedRouteTypes.length - 1
                                }}
                                muuta)</span
                              >
                            </template>
                            <template v-slot:message>
                              <span
                                >Rajoita haku vain valittuihin reittityyppeihin<br />
                                (jos et rajoita hakua niin etsitään kaikista
                                reittityypeistä)</span
                              >
                            </template>
                          </v-select>

                          <v-select
                            v-if="
                              searchOptions.selectedRouteOrPoint.length == 0 ||
                                searchOptions.selectedRouteOrPoint.includes(
                                  'Kohde'
                                )
                            "
                            v-model="searchOptions.selectedPointTypes"
                            :items="searchOptions.pointTypes"
                            :menu-props="{ bottom: true, offsetY: true }"
                            label="Kohdetyyppi"
                            multiple
                            outlined
                            style="min-height: 48px;"
                            hint="placeholder for v-slot:message"
                            class="mb-2"
                          >
                            <template v-slot:selection="{ item, index }">
                              <v-chip v-if="index === 0">
                                <span>{{ item }}</span>
                              </v-chip>
                              <span v-if="index === 1" class="grey--text caption"
                                >(+{{
                                  searchOptions.selectedPointTypes.length - 1
                                }}
                                muuta)</span
                              >
                            </template>
                            <template v-slot:message>
                              <span
                                >Rajoita haku vain valittuihin kohdetyyppeihin<br />
                                (jos et rajoita hakua niin etsitään kaikista
                                kohdetyypeistä)</span
                              >
                            </template>
                          </v-select>

                          <v-select
                            v-model="searchOptions.selectedMunicipalities"
                            :items="searchOptions.municipalities"
                            :menu-props="{ bottom: true, offsetY: true }"
                            label="Sijaintikunta"
                            multiple
                            outlined
                            style="min-height: 48px;"
                            hint="placeholder for v-slot:message"
                            class="mb-2"
                          >
                            <template v-slot:selection="{ item, index }">
                              <v-chip v-if="index === 0">
                                <span>{{ item }}</span>
                              </v-chip>
                              <span v-if="index === 1" class="grey--text caption"
                                >(+{{
                                  searchOptions.selectedMunicipalities.length - 1
                                }}
                                muuta)</span
                              >
                            </template>
                            <template v-slot:message>
                              <span
                                >Rajoita haku vain valittuihin kuntiin<br />
                                (jos et rajoita hakua niin etsitään kaikista
                                kunnista)</span
                              >
                            </template>
                          </v-select>

                          <v-subheader class="pl-0" style="font-size: 16px;">
                            Etäisyys sijainnistani korkeintaan
                            <span
                              v-if="
                                searchOptions.maxDistanceFromCurrentLocation != 0
                              "
                              style="white-space: pre-wrap;"
                              >:
                              {{ searchOptions.maxDistanceFromCurrentLocation }}
                              km
                            </span>
                          </v-subheader>
                          <v-slider
                            v-model="searchOptions.maxDistanceFromCurrentLocation"
                            thumb-label
                          ></v-slider>

                          <v-container
                            class="pl-0"
                            v-if="
                              searchOptions.selectedRouteOrPoint.length == 0 ||
                                searchOptions.selectedRouteOrPoint.includes(
                                  'Reitti'
                                )
                            "
                          >
                            <v-subheader class="pl-0" style="font-size: 16px;">
                              Reitin pituus
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] != 0 &&
                                    searchOptions.routeLengthRange[1] != 100
                                "
                                style="white-space: pre-wrap;"
                                >: {{ searchOptions.routeLengthRange[0] }} -
                                {{ searchOptions.routeLengthRange[1] }} km
                              </span>
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] == 0 &&
                                    searchOptions.routeLengthRange[1] != 100
                                "
                                style="white-space: pre-wrap;"
                                >: alle {{ searchOptions.routeLengthRange[1] }} km
                              </span>
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] != 0 &&
                                    searchOptions.routeLengthRange[1] == 100
                                "
                                style="white-space: pre-wrap;"
                                >: yli {{ searchOptions.routeLengthRange[0] }} km
                              </span>
                            </v-subheader>
                            <v-range-slider
                              v-model="searchOptions.routeLengthRange"
                              thumb-label
                              min="0"
                              max="100"
                            ></v-range-slider>
                          </v-container>
                        </v-form>
                      </template>
                    </v-container>

                    <v-card-actions
                      v-if="renderStructureTEST.layersLoaded"
                      class="justify-center"
                    >
                      <v-btn
                        color="success"
                        class="mr-2"
                        width="120px"
                        @click="searchRoutesAndPoints"
                      >
                        Hae
                      </v-btn>

                      <v-btn
                        color="warning"
                        width="120px"
                        @click="
                          resetSearchForm();
                          resetSearchResults();
                        "
                      >
                        Tyhjennä
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-row>
              </v-tab-item>

              <!-- Search results -->
              <v-tab-item class="py-4">
                <v-row justify="center" class="mx-0">
                  <v-card
                    width="100%"
                    flat
                    class="ma-2 px-2"
                    :min-height="
                      $vuetify.breakpoint.smAndUp
                        ? $vuetify.breakpoint.height - 300
                        : ''
                    "
                  >
                    <template v-if="searchResults.searchOngoing">
                      <div class="text-center">
                        <h4 class="mt-8 mb-4">Haku käynnissä</h4>
                        <v-progress-circular
                          :size="50"
                          color="primary"
                          indeterminate
                        ></v-progress-circular>
                      </div>
                    </template>

                    <template v-else-if="!hasSearchResults">
                      <div class="text-center">
                        <h4 class="mt-8">Ei hakutuloksia</h4>
                      </div>
                    </template>

                    <template v-else>
                      <v-card-actions class="my-4">
                        <v-row class="">
                          <v-col>
                            <v-btn
                              color="success"
                              class="mr-2 mb-4"
                              width="380px"
                              cols="12"
                              @click="showSearchResultsOnMap"
                              >Näytä valitut kartalla ja sulje ikkuna</v-btn
                            >
                            <v-btn
                              color="warning"
                              class="mb-4"
                              width="380px"
                              cols="12"
                              @click="resetSelectedSearchResults"
                            >
                              Tyhjennä valinnat
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-card-actions>

                      <!-- Points -->
                      <v-card
                        color="#e4effa"
                        class="px-2 pb-2"
                        v-if="searchResults.points.objects.length > 0"
                      >
                        <v-card-title>
                          Kohteet ( {{ searchResults.points.objects.length }} )
                          <v-spacer></v-spacer>
                          <v-text-field
                            v-model="searchResults.points.search"
                            append-icon="mdi-magnify"
                            label="Suodata kohteista"
                            single-line
                            hide-details
                          ></v-text-field>
                        </v-card-title>
                        <v-data-table
                          :headers="searchResults.resultHeadersPoints"
                          :items="searchResults.points.objects"
                          :items-per-page="5"
                          :search="searchResults.points.search"
                          :expanded.sync="searchResults.points.expanded"
                          show-select
                          show-expand
                          single-expand
                          multi-sort
                          v-model="searchResults.points.selected"
                          :footer-props="{
                            itemsPerPageText: 'Rivejä yhdellä sivulla'
                          }"
                        >
                          <template v-slot:[`footer.page-text`]="props">
                            {{ props.pageStart }}-{{ props.pageStop }} /
                            {{ props.itemsLength }}
                          </template>

                          <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length" class="mb-2 pl-sm-14">
                              <div class="pa-4">
                                <p v-if="item.properties.info_fi">
                                  {{ item.properties.info_fi }}
                                </p>
                                <p v-if="item.properties.www_fi">
                                  <a
                                    :href="item.properties.www_fi"
                                    target="_blank"
                                    >{{ item.properties.www_fi }}
                                  </a>
                                  <br />(avautuu uuteen ikkunaan)
                                </p>
                                <p
                                  v-if="
                                    !item.properties.info_fi &&
                                      !item.properties.www_fi
                                  "
                                >
                                  Ei lisätietoja
                                </p>
                              </div>
                            </td>
                          </template>

                          <!-- <template
                            v-if="$vuetify.breakpoint.xsOnly"
                            v-slot:item.properties.name_fi="{ item }"
                          >
                          Buu: {{ item.properties.name_fi }}
                          </template> -->
                        </v-data-table>
                      </v-card>

                      <!-- Routes -->
                      <v-card
                        color="#e4effa"
                        class="px-2 pb-2 mt-4"
                        v-if="searchResults.routes.objects.length > 0"
                      >
                        <v-card-title>
                          <!-- TODO maybe a bit prettier with count smaller and grey? -->
                          Reitit ( {{ searchResults.routes.objects.length }} )
                          <v-spacer></v-spacer>
                          <v-text-field
                            v-model="searchResults.routes.search"
                            append-icon="mdi-magnify"
                            label="Suodata reiteistä"
                            single-line
                            hide-details
                          ></v-text-field>
                        </v-card-title>
                        <v-data-table
                          :headers="searchResults.resultHeadersRoutes"
                          :items="searchResults.routes.objects"
                          :items-per-page="5"
                          :search="searchResults.routes.search"
                          :expanded.sync="searchResults.routes.expanded"
                          show-select
                          show-expand
                          single-expand
                          multi-sort
                          v-model="searchResults.routes.selected"
                          :footer-props="{
                            itemsPerPageText: 'Rivejä yhdellä sivulla'
                          }"
                        >
                          <template v-slot:[`footer.page-text`]="props">
                            {{ props.pageStart }}-{{ props.pageStop }} /
                            {{ props.itemsLength }}
                          </template>

                          <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length" class="mb-2 pl-sm-14">
                              <div class="pa-4">
                                <p v-if="item.properties.info_fi">
                                  {{ item.properties.info_fi }}
                                </p>
                                <p v-if="item.properties.www_fi">
                                  <a
                                    :href="item.properties.www_fi"
                                    target="_blank"
                                    >{{ item.properties.www_fi }}
                                  </a>
                                  <br />(avautuu uuteen ikkunaan)
                                </p>
                                <p
                                  v-if="
                                    !item.properties.info_fi &&
                                      !item.properties.www_fi
                                  "
                                >
                                  Ei lisätietoja
                                </p>
                              </div>
                            </td>
                          </template>
                        </v-data-table>
                      </v-card>
                    </template>
                  </v-card>
                </v-row>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Show vector-feature info -dialog -->
    <template v-if="Object.entries(clickedVectorFeature).length > 0">
      <v-dialog
        v-model="dialogVectorFeatureInfo"
        persistent
        scrollable
        max-width="700"
      >
        <v-card>
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>{{
              clickedVectorFeature.properties.name_fi
            }}</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click.stop="closeDialog('feature-info')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-row justify="center" class="mx-0">
              <v-card width="100%" max-width="650px" flat class="ma-2">
                <v-card-text>
                  <p>
                    {{ clickedVectorFeature.properties.class2_fi }}<br />
                    <span v-if="clickedVectorFeature.properties.address">
                      {{ clickedVectorFeature.properties.address }},
                      <span> </span>
                      {{ clickedVectorFeature.properties.zip }}
                      <span> </span>
                    </span>
                    {{ clickedVectorFeature.properties.municipali }}
                  </p>
                  <p>{{ clickedVectorFeature.properties.info_fi }}</p>
                  <p v-if="clickedVectorFeature.properties.www_fi">
                    <a
                      :href="clickedVectorFeature.properties.www_fi"
                      target="_blank"
                      >{{ clickedVectorFeature.properties.www_fi }}
                    </a>
                    <br />(avautuu uuteen ikkunaan)
                  </p>
                </v-card-text>
              </v-card>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Welcome-dialog -->
    <template>
      <v-dialog
        v-model="dialogWelcome"
        persistent
        scrollable
        max-width="700"
      >
        <v-card>
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>
              Tervetuloa käyttämään Virma Karttaa
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click="dialogWelcome = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text style="color: rgba(0,0,0,1);">
            <p>
              Virma Kartan avulla voit tarkastella Varsinais-Suomen
              virkistyskohteita ja -reittejä.<br />
              Voit tutkia reaaliaikaisesti omaa sijaintiasi reitillä tai
              esimerkiksi etsiä lähimmät uimarannat tai matkailupalvelut. Löydät
              palvelusta jo yli 1000 kohdetta, ja määrä kasvaa koko ajan.
            </p>
            <p><strong>HUOMIO!<br>
            Virma Kartta on vielä kehitysvaiheessa ja palvelun ulkoasu ja toiminnallisuus saattavat muuttua.</strong></p>
            <p>
              Tästä pääset suoraan suosituimpiin reitteihimme sekä kohteisiin!
            </p>
          

            <v-container fluid>
              <v-row dense>
                <v-col
                  v-for="(card, index) in welcomeContent.items"
                  :key="index"
                  cols="12"
                  :sm="card.columnWidth"
                >
                  <v-card
                    :color="
                      card.bgColor == ''
                        ? welcomeContent.defaultBgColor
                        : card.bgColor
                    "
                    @click="handleWelcomeDialogClick(card)"
                  >
                    <v-img
                      :src="
                        card.imageName.length == 0
                          ? ''
                          : require(`@/assets/${card.imageName}`)
                      "
                      :alt="card.name"
                      class="white--text align-end"
                      :height="welcomeContent.cardHeight"
                    >
                      <v-card-title v-text="card.name"></v-card-title>
                    </v-img>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <!-- Help-dialog -->
    <template>
      <v-dialog
        v-model="dialogHelp"
        persistent
        scrollable
        max-width="1000px"
        :fullscreen="$vuetify.breakpoint.xsOnly"
      >
        <v-card
          style="min-width:350px;"
          :min-height="
            $vuetify.breakpoint.smAndUp ? $vuetify.breakpoint.height - 200 : ''
          "
        >
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>
              Ohjeet
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click.stop="closeDialog('help')">
              <v-icon>mdi-close</v-icon>
            </v-btn>

            <template v-slot:extension>
              <v-tabs
                v-model="dialogHelpTabs"
                background-color="#627f9a"
                dark
                centered
              >
                <v-tab>Toiminnot</v-tab>
                <v-tab>Karttasymbolit</v-tab>
              </v-tabs>
            </template>
          </v-toolbar>

          <v-card-text>
            <v-tabs-items v-model="dialogHelpTabs">
              <!-- App functions -->
              <v-tab-item class="py-4">
                <v-container fluid>
                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            toggleDialog('search', true);
                          "
                        >
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Hakutoiminto</p>
                      Etsi reittejä ja kohteita eri hakuehdoilla.<br />
                      Mikäli et rajoita hakua hakuehdoilla, etsitään kaikista
                      Virma-aineiston reiteistä ja kohteista.<br />
                      Halutut hakutulokset voit lisätä kartalle valitsemalla ne
                      ('ruksi') ja painamalla "Näytä valitut hakutulokset
                      kartalla".
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          v-if="!$vuetify.breakpoint.mobile"
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            // not using toggleDialog('layers', true) here
                            // because that would push hash to url in desktop
                            dialogLayers = true;
                          "
                        >
                          <v-icon>mdi-layers-triple</v-icon>
                        </v-btn>

                        <v-btn
                          v-else
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            toggleDialog('layers', true);
                          "
                        >
                          <v-icon>mdi-layers-triple</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Tasot-valikko</p>
                      Valitse kartalla näkyvät karttatasot.<br />
                      Valikko on jaettu kategorioihin, joista osa sisältää
                      alitasoja ja on avattavissa oikeassa reunassa olevasta
                      nuolikuvakkeesta.<br />
                      Kategorian voi piilottaa / tuoda näkyviin
                      silmäkuvakkeesta.<br />
                      Kategoriassa näkyvät valittuna olevat alitasot ('ruksi').<br />
                      Hakutoiminnon kautta kartalle lisätyt hakutulokset näkyvät
                      kategoriassa "Hakutulokset"<br />
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            toggleFullScreen();
                          "
                        >
                          <v-icon>mdi-overscan</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Kokoruututila</p>
                      Suurenna sovellus täyttämään koko ruutu ja palauta se
                      takaisin.
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn color="#627f9a" dark fab small depressed>
                          <v-icon>mdi-help</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Ohjeet</p>
                      Näyttää tämän ohje-valikon.
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            showPosition.status = !showPosition.status;
                            toggleShowAndUpdatePosition();
                          "
                        >
                          <v-icon>mdi-crosshairs-gps</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Näytä sijainti</p>
                      Näyttää käyttäjän sijainnin kartalla. Toimii parhaiten
                      älypuhelimilla ja muilla laitteilla joissa on
                      gps-vastaanotin.<br />
                      Vihreä: päällä, harmaa: pois päältä.
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#627f9a"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            keepMapCenteredToPosition = !keepMapCenteredToPosition;
                          "
                        >
                          <v-icon>mdi-image-filter-center-focus</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Seuraa sijaintia</p>
                      Siirtää karttapohjaa käyttäjän liikkuessa niin että
                      sijaintikuvake pysyy aina näytön keskellä. Mikäli liikutat
                      karttaa, toiminto kytkeytyy automaattisesti pois päältä.<br />
                      Vihreä: päällä, harmaa: pois päältä.
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>

              <!-- Map symbols / legend -->
              <v-tab-item>
                <v-container fluid>
                  <!-- Virkistysreitit -->
                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="d-flex">
                      <div class="ml-10">
                        <p class="text-h6 mb-1">Virkistysreitit</p>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row
                    class="d-flex align-start"
                    v-for="route in helpDialogSymbols.routes"
                    :key="route.key"
                  >
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-img
                          :src="
                            route.imageName.length == 0
                              ? ''
                              : require(`@/assets/mapsymbols/${route.imageName}`)
                          "
                          :alt="route.key"
                          class="mt-4"
                        ></v-img>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">{{ route.key }}</p>
                      {{ route.description }}
                    </v-col>
                  </v-row>

                  <!-- Virkistyskohteet -->
                  <v-row class="d-flex align-start mt-8">
                    <v-col cols="12" class="d-flex">
                      <div class="ml-10">
                        <p class="text-h6 mb-1">Virkistyskohteet</p>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row
                    class="d-flex align-start"
                    v-for="point in helpDialogSymbols.pointsRecreation"
                    :key="point.key"
                  >
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-img
                          :src="
                            point.imageName.length == 0
                              ? ''
                              : require(`@/assets/mapsymbols/${point.imageName}`)
                          "
                          :alt="point.key"
                          max-width="40px"
                          max-height="40px"
                        ></v-img>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">{{ point.key }}</p>
                      {{ point.description }}
                    </v-col>
                  </v-row>

                  <!-- Matkailukohteet -->
                  <v-row class="d-flex align-start mt-8">
                    <v-col cols="12" class="d-flex">
                      <div class="ml-10">
                        <p class="text-h6 mb-1">Matkailukohteet</p>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row
                    class="d-flex align-start"
                    v-for="point in helpDialogSymbols.pointsTravel"
                    :key="point.key"
                  >
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-img
                          :src="
                            point.imageName.length == 0
                              ? ''
                              : require(`@/assets/mapsymbols/${point.imageName}`)
                          "
                          :alt="point.key"
                          max-width="40px"
                          max-height="40px"
                        ></v-img>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">{{ point.key }}</p>
                      {{ point.description }}
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<style>
html {
  overflow-y: hidden !important;
}

tr.v-data-table__expanded__content td a {
  word-break: break-all;
}

tr.v-data-table__expanded__content td {
  background-color: #b9cee4;
}

tr.v-data-table__expanded__row td {
  background-color: #b9cee4;
}

tr.v-data-table__expanded__row.v-data-table__mobile-table-row td {
  background-color: #b9cee4 !important;
}

tr:nth-of-type(even).v-data-table__mobile-table-row td {
  background-color: rgba(236, 237, 237);
}

tr:nth-of-type(even).v-data-table__mobile-table-row td:hover {
  background-color: rgba(236, 237, 237);
}

tr:nth-of-type(odd).v-data-table__mobile-table-row td:hover {
  background-color: rgb(250, 250, 250);
}

tr:nth-of-type(odd).v-data-table__mobile-table-row td {
  background-color: rgb(250, 250, 250);
}

tbody tr:nth-of-type(even) {
  background-color: rgba(236, 237, 237);
}

tbody tr:nth-of-type(odd) {
  background-color: rgb(250, 250, 250);
}

.v-data-table-header {
  background-color: #e4effa;
  color: white;
}

.v-data-footer {
  background-color: #e4effa;
}

.theme--light.v-data-table thead tr th {
  color: white;
}

.no-blur:not(.v-btn--text):not(.v-btn--outlined):hover:before {
  opacity: 0 !important;
}
</style>

<script>
// TODO remove proj4 if / when geolocation api is not used anymore (but Oskari native requests instead)
import proj4 from "../node_modules/proj4";
import { backGroundMaps } from "./config.js";
import { renderStructureTEST } from "./config.js";
import { searchConfig } from "./config.js";
import { mapConfig } from "./config.js";
import { mapLegend } from "./config.js";
import { welcomeContent } from "./config.js";

//TODO should one always check for Oskari request availability / errors in order to make more general implementation
// (= degrades or informs if Oskari backend version does not support used request etc.)

export default {
  props: {
    source: String
  },

  data: () => ({
    showPosition: { status: false, id: "" },
    keepMapCenteredToPosition: false,
    keepMapRotationNorthUp: true,
    dataAfterPositionUpdate: {},
    zoomAfterPreviousMapMovement: "",
    channel: {},
    mapSrc: mapConfig.mapAddress,
    mapLegendIcons: {
      route: mapLegend.icons.route
    },
    dialogLayers: false,
    dialogSearch: false,
    dialogVectorFeatureInfo: false,
    clickedVectorFeature: {},
    dialogSearchTabs: null,
    dialogWelcome: true,
    dialogHelp: false,
    dialogHelpTabs: null,
    virmaReititJson: {},
    searchOptions: {
      searchText: "",
      routeOrPoint: ["Reitti", "Kohde"],
      selectedRouteOrPoint: [],
      routeTypes: [
        // TODO fetch types from geoserver, fill here
        "Kulttuuriulkoilureitti",
        "Kuntoreitti",
        "Luontopolku",
        "Matkailureitti",
        "Melontareitti",
        "Pyöräilyreitti",
        "Retkeilyreitti",
        "Retkilatu"
      ],
      selectedRouteTypes: [],
      pointTypes: [
        // TODO fetch types from geoserver, fill here
        "Ankkuripaikka",
        "Hätäsatama",
        "Jätepiste",
        "Kalastuspaikka",
        "Käyntisatama",
        "Keittokatos- / ruoanlaittopaikka",
        "Kulttuuripalvelu",
        "Lähde tai kaivo",
        "Leirikeskus",
        "Leirintä- tai caravanalue",
        "Levähdyspaikka",
        "Luonnonmuistomerkki tai näköalapaikka",
        "Luonto- tai lintutorni",
        "Majoituspalvelu",
        "Moottorirata",
        "Ohjelma- tai elämyspalvelu",
        "Opaspalvelu",
        "Opastuskeskus",
        "Opastuspiste",
        "Päivälaavu tai -kota",
        "Palvelusatama",
        "Polttopuusuoja",
        "Rantautumispaikka",
        "Retkeilyä palveleva parkkipaikka",
        "Retki- tai luonnonsatama",
        "Ruokapalvelu",
        "Sauna",
        "Suojasatama",
        "Talviuimapaikka",
        "Telttailupaikka",
        "Tilavuokraus- tai kokouspalvelu",
        "Tulipaikka",
        "Tupa",
        "Uimapaikka",
        "Uimaranta",
        "Ulkoilu- tai hiihtomaja",
        "Varauslaavu tai -kota",
        "Varaussauna",
        "Veneenlaskupaikka",
        "Vieraslaituri",
        "Vierassatama",
        "Virkistykseen liittyvä erityiskohde",
        "Virkistysreitin lähtöpiste",
        "Yhteysaluslaituri",
        "Yleisö-wc tai -puucee",
        "Yöpymislaavu tai -kota"
      ],
      selectedPointTypes: [],
      municipalities: [
        "Aura",
        "Kaarina",
        "Kemiönsaari",
        "Koski Tl",
        "Kustavi",
        "Laitila",
        "Lieto",
        "Loimaa",
        "Marttila",
        "Masku",
        "Mynämäki",
        "Naantali",
        "Nousiainen",
        "Oripää",
        "Paimio",
        "Parainen",
        "Pyhäranta",
        "Pöytyä",
        "Raisio",
        "Rusko",
        "Salo",
        "Sauvo",
        "Somero",
        "Taivassalo",
        "Turku",
        "Uusikaupunki",
        "Vehmaa"
      ],
      selectedMunicipalities: [],
      maxDistanceFromCurrentLocation: "",
      routeLengthRange: [0, 100]
    },
    searchResults: {
      routes: {
        objects: [],
        visible: false,
        selected: [],
        selectedResultsRouteTypes: [],
        search: "",
        expanded: []
      },
      points: {
        objects: [],
        visible: false,
        selected: [],
        selectedResultsPointTypes: [],
        search: "",
        expanded: []
      },
      visible: false,
      count: 0, // TODO is this in use?
      searchOngoing: false,
      resultHeadersPoints: [
        {
          text: "Kohteen nimi",
          align: "start",
          sortable: false,
          value: "properties.name_fi"
        },
        { text: "Tyyppi", value: "properties.class2_fi" },
        { text: "Sijainti", value: "properties.municipali" },
        { text: "", value: "data-table-expand" }
      ],
      resultHeadersRoutes: [
        {
          text: "Reitin nimi",
          align: "start",
          sortable: false,
          value: "properties.name_fi"
        },
        { text: "Pituus", value: "properties.length_m" },
        { text: "Sijainti", value: "properties.municipali" },
        { text: "", value: "data-table-expand" }
      ]
    },
    selectedSearchResultLayers: {
      visible: false,
      selectedPoints: [],
      selectedRoutes: []
    },
    backGroundMaps: {}, // loaded from config.js
    renderStructureTEST: {}, // loaded from config.js
    welcomeContent: {}, // loaded from config.js in mounted-property
    helpDialogSymbols: {
      // place images to assets/mapsymbols/
      routes: [
        {
          key: "Retkeilyreitti",
          description:
            "Patikointiin tarkoitettu, yleensä vähintään useita kilometrejä pitkä reitti, joka on yleensä maastossa viitoitettu.",
          imageName: "retkeilyreitti_60px.jpg"
        },
        {
          key: "Luontopolku",
          description:
            "Suhteellisen lyhyt luonnossa kulkeva polku, jonka varrella on yleensä luontoon ja polun ympäristöön liittyviä opastauluja. Opastussisältö voi olla myös digitaalista mobiililaitteilla luettavaa.",
          imageName: "luontopolku_60px.jpg"
        },
        {
          key: "Kulttuuriulkoilureitti",
          description:
            "Yleisesti kulttuuriympäristöön, kulttuuriperintöön ja kulttuurimaisemaan pohjautuva reitti. Reitti voi kulkea paikoin myös hyvin urbaanissa ympäristössä.",
          imageName: "kulttuuriulkoilureitti_60px.jpg"
        },
        {
          key: "Hevosreitti",
          description: "Ratsastuskäyttöön suunnattu virkistysreitti.",
          imageName: ""
        },
        {
          key: "Maastopyöräilyreitti",
          description:
            "Pääsääntöisesti tai kokonaan maastopyöräilyyn tarkoitettu reitti.",
          imageName: ""
        },
        {
          key: "Melontareitti",
          description:
            "Melontaan tarkoitettu reitti, jonka varrella on yleensä kanootin nosto- ja laskupaikkoja sekä mahdollisuus kantaa kanootti kosken tai padon ohi.",
          imageName: "melontareitti_60px.jpg"
        },
        {
          key: "Kuntoreitti",
          description:
            "Yleensä valaistu juoksuun tai hölkkäämiseen tarkoitettu reitti puru- tai sorapinnoitteella. ",
          imageName: "kuntoreitti_60px.jpg"
        },
        {
          key: "Retkilatu",
          description:
            "Retkihiihtoon tarkoitettu latupohja. Yleensä perinteisen tyylin latu. Retkiladun ura voi olla merkitty myös vesialueelle, jolloin latu tehdään jäätilanteen niin salliessa.",
          imageName: "retkilatu_60px.jpg"
        },
        {
          key: "Matkailureitti",
          description:
            "Yleensä kymmeniä kilometrejä pitkä reitti, joka on suunniteltu kuljettavan muulla tavoin kuin kävellen esim. autolla tai ryhmämatkailubussilla.",
          imageName: "matkailureitti_60px.jpg"
        },
        {
          key: "Pyöräilyreitti",
          description: "Pyöräilyyn tarkoitettu tiepohjia noudattava reitti.",
          imageName: "pyöräilyreitti_60px.jpg"
        }
      ],
      pointsRecreation: [
        {
          key: "Luonto-tai lintutorni",
          description: "Lintujen tai maiseman tarkasteluun tarkoitettu torni",
          imageName: "lintutorni_40px.jpg"
        },
        {
          key: "Kalastuspaikka",
          description: "Erityisesti kalastukseen tarkoitettu paikka",
          imageName: "kalastuspaikka_40px.jpg"
        },
        {
          key: "Rantautumispaikka",
          description:
            "Paikka, jossa on mahdollisuus rantautua veneellä tai kanootilla",
          imageName: "rantautumispaikka_40px.jpg"
        },
        {
          key: "Veneenlaskupaikka",
          description:
            "Paikka, jossa on mahdollisuus laskea vene tai kanootti trailerilta veteen ramppia pitkin",
          imageName: "veneenlaskupaikka_40px.jpg"
        },
        {
          key: "Opastuspiste",
          description:
            "Piste, joka tarjoaa tietoa esim. reitistä tai kohteesta. Ei henkilökuntaa.",
          imageName: "opastuspiste_40px.jpg"
        },
        {
          key: "Opastuskeskus",
          description:
            "Piste, joka tarjoaa tietoa esim. reitistä tai kohteesta. Usein rakennus tai laajempi infokokonaisuus. Opastuskeskuksessa on yleensä myös henkilökuntaa ainakin osan ajasta.",
          imageName: "opastuskeskus_40px.jpg"
        },
        {
          key: "Yleisö-wc tai -puucee",
          description:
            "Retkeilijöitä tai kävijöitä palveleva yleisesti avoinna oleva wc",
          imageName: "yleisöwc_40px.jpg"
        },
        {
          key: "Levähdyspaikka",
          description:
            "Yleensä penkki tai penkkipöytäyhdistelmä, jossa voi levähtää reittiä kulkiessa. Ei tulentekomahdollisuutta.",
          imageName: "levähdyspaikka_40px.jpg"
        },
        {
          key: "Tulipaikka",
          description:
            "Yleensä reitin varrella tai virkistyskohteessa oleva paikka, jossa on mahdollisuus tehdä tulet. Tulipaikalla voi olla polttopuuhuolto, mutta voi myös olla että paikalle pitää ottaa omat polttopuut mukaan.",
          imageName: "tulipaikka_40px.jpg"
        },
        {
          key: "Keittokatos-/ruoanlaittopaikka",
          description:
            "Katettu tulipaikka, jossa on mahdollisuus grillata tai tehdä ruokaa",
          imageName: "keittokatos_40px.jpg"
        },
        {
          key: "Vesipiste",
          description: "Juotavaksi kelpaavan veden jakelupiste. ",
          imageName: ""
        },
        {
          key: "Telttailupaikka",
          description: "Erityisesti telttailuun tarkoitettu alue.",
          imageName: "telttailupaikka_40px.jpg"
        },
        {
          key: "Yöpymislaavu tai -kota",
          description: "Yöpymiseen tarkoitettu makuulaavu tai -kota.",
          imageName: "yöpymislaavu_40px.jpg"
        },
        {
          key: "Päivälaavu tai -kota",
          description: "Päiväkäyttöön tarkoitettu laavu tai kota.",
          imageName: "päivälaavu_40px.jpg"
        },
        {
          key: "Tupa",
          description: "Yöpymiseen tai päiväkäyttöön tarkoitettu sisätila.",
          imageName: "tupa_40px.jpg"
        },
        {
          key: "Retkeilyä palveleva parkkipaikka",
          description:
            "Yleensä retkeilyreitin aloituspisteeseen tai virkistyskohteen yhteyteen sijoitettu parkkialue",
          imageName: "retkeilyparkkipaikka_40px.jpg"
        },
        {
          key: "Virkistysreitin lähtöpiste",
          description:
            "Piste joka on suunniteltu virkistysreitin lähtöpaikaksi.",
          imageName: "virkistysreitin_lähtöpiste_40px.jpg"
        },
        {
          key: "Melontareitin lähtöpiste",
          description: "Piste joka on suunniteltu melontareitin lähtöpaikaksi.",
          imageName: ""
        },
        {
          key: "Retkiluistelureitin lähtöpiste",
          description:
            "Piste joka on suunniteltu retkiluistelureitin lähtöpaikaksi.",
          imageName: ""
        },
        {
          key: "Retkiladun lähtöpiste",
          description:
            "Piste joka on suunniteltu retkihiihtoladun lähtöpaikaksi.",
          imageName: ""
        },
        {
          key: "Uimapaikka",
          description: "Yleinen uimapaikka.",
          imageName: "uimapaikka_40px.jpg"
        },
        {
          key: "Uimaranta",
          description:
            "Yleinen uimapaikka, jossa voi olla ajoittain uimavalvontaa ja muita palveluita.",
          imageName: "uimaranta_40px.jpg"
        },
        {
          key: "Sauna",
          description:
            "Yleinen sauna, jonne voi olla pieni saunamaksu. Yleensä tällaisella saunalla on tietyt ajat, jolloin saunaan voi mennä ilman varausta. Sauna voi toimia varaussaunana osan aikaa.",
          imageName: "sauna_40px.jpg"
        },
        {
          key: "Talviuimapaikka",
          description:
            "Yleinen uimapaikka myös talvikäyttöön. Yleensä talviuimapaikalla on myös sauna.",
          imageName: "talviuimapaikka_40px.jpg"
        },
        {
          key: "Luonnonmuistomerkki tai näköalapaikka",
          description:
            "Luonnon erityislaatuinen kohde tai luontainen näköalapaikka esim. linnavuori tai muu korkea paikka.",
          imageName: "luonnonmuistomerkki_40px.jpg"
        },
        {
          key: "Suojasatama",
          description: "Tuulelta suojainen satamapaikka.",
          imageName: "suojasatama_40px.jpg"
        },
        {
          key: "Turvasatama",
          description:
            "Tuulelta suojainen satamapaikka, jonne voi tilapäisesti rantautua.",
          imageName: ""
        },
        {
          key: "Retki- tai luonnonsatama",
          description:
            "Yleinen, kaikille avoin satama, jossa ei yleensä ole palveluita.",
          imageName: "retkisatama_40px.jpg"
        },
        {
          key: "Ankkuripaikka",
          description: "Suojainen paikka, jonne voi ankkuroitua.",
          imageName: "ankkuripaikka.jpg"
        },
        {
          key: "Hätäsatama",
          description: "Hätätilassa käytettävä satamapaikka.",
          imageName: "hätäsatama_40px.jpg"
        },
        {
          key: "Lähde tai kaivo",
          description:
            "Vesipisteenä oleva lähde tai kaivo, jonka vesi on suoraan tai keittämällä turvallista juotavaksi.",
          imageName: ""
        },
        {
          key: "Jätepiste",
          description:
            "Retkeilijöiden käyttöön tarkoitettu jäte- tai kierrätyspiste.",
          imageName: "jätepiste_40px.jpg"
        },
        {
          key: "Polttopuusuoja",
          description:
            "Polttopuuhuollettujen tulipaikkojen ja laavujen polttopuiden säilytykseen tarkoitettu vaja.",
          imageName: "polttopuusuoja_40px.jpg"
        },
        {
          key: "Virkistykseen liittyvä erityiskohde",
          description: "Muu erityinen virkistyskohde.",
          imageName: "virkistyserityiskohde_40px.jpg"
        }
      ],
      pointsTravel: [
        {
          key: "Palvelusatama",
          description:
            "Veneilyä palveleva satama, jossa on usein jokin palvelu, kuten kierrätyspiste.",
          imageName: "palvelusatama_40px.jpg"
        },
        {
          key: "Leirintä- tai caravanalue",
          description:
            "Alue, jossa voi leiriytyä tai yöpyä asuntovaunulla tai autolla. Maksulliset palvelut.",
          imageName: "leirintäalue_40px.jpg"
        },
        {
          key: "Kulttuuripalvelu",
          description: "Matkailuun liittyvä kulttuuripalvelu.",
          imageName: "kulttuuripalvelu_40px.jpg"
        },
        {
          key: "Ulkoilu- tai hiihtomaja",
          description:
            "Ulkoiluun liittyvä kohde, jossa on sesongin aikana yleensä jotain palvelua.",
          imageName: "ulkoiluhiihtomaja_40px.jpg"
        },
        {
          key: "Ruokapalvelu",
          description:
            "Matkailijoille ruokapalveluita tarjoava yritys. Voi myös toimittaa catering-palveluita maastoon.",
          imageName: ""
        },
        {
          key: "Vieraslaituri",
          description:
            "Laituri, johon voi jättää veneen esim. kylässä asiointia varten. Yleensä ei muita palveluita.",
          imageName: "vieraslaituri_40px.jpg"
        },
        {
          key: "Käyntisatama",
          description:
            "Veneilyä palveleva satama, jossa on yleensä joitain palveluita, mutta vierassatamaa vähemmän. Veneilysesongin aikana satamassa voi olla henkilökuntaa.",
          imageName: "käyntisatama_40px.jpg"
        },
        {
          key: "Leirikeskus",
          description:
            "Varauksesta käyttöön saatava tai tietylle ryhmälle kuten seurakunnan jäsenille tarkoitettu leirikeskus.",
          imageName: "leirikeskus_40px.jpg"
        },
        {
          key: "Yhteysaluslaituri",
          description: "Laituri, johon liikennöi yhteysalus.",
          imageName: "yhteysaluslaituri_40px.jpg"
        },
        {
          key: "Majoituspalvelu",
          description:
            "Majoituspalvelua retkeilijöille ja matkailijoille tarjoava kohde.",
          imageName: "majoituspalvelu_40px.jpg"
        },
        {
          key: "Opaspalvelu",
          description:
            "Retkeilijöille tai matkailijoille opastusta tarjoava palvelu. Usein opastusta on saatavissa palvelun lähiseudulle ja erilaisista teemoista esim. kulttuuriympäristö, historia tai luonto",
          imageName: ""
        },
        {
          key: "Ohjelma- tai elämyspalvelu",
          description:
            "Matkailijoille tai retkeilijöille ohjelmapalveluita tarjoava yritys tai yhteisö.",
          imageName: ""
        },
        {
          key: "Tilavuokraus- tai kokouspalvelu",
          description:
            "Matkailijoille tai retkeilijöille kokous- tai kokoontumistiloja vuokraava yritys tai yhteisö.",
          imageName: "tilavuokraus_40px.jpg"
        },
        {
          key: "Varauslaavu tai -kota",
          description:
            "Ennakkovarauksesta käyttöön saatava tai vuokrattava laavu tai kota. ",
          imageName: "varauslaavu_40px.jpg"
        },
        {
          key: "Vierassatama",
          description:
            "Veneilyä palveleva satama, jossa on erittäin hyvä palveluvarustus ja paikalla on henkilökuntaa veneilysesongin aikana. Yleensä ainakin  osa palveluista on maksullisia.",
          imageName: "vierassatama_40px.jpg"
        },
        {
          key: "Varaussauna",
          description: "Varauksesta käyttöön saatava tai vuokrattava sauna.",
          imageName: ""
        }
      ]
    }
  }),

  computed: {
    hasSearchResults() {
      if (
        this.searchResults.points.objects.length > 0 ||
        this.searchResults.routes.objects.length > 0
      ) {
        // TODO debug, remove
        console.log("POINTS: " + this.searchResults.points.objects.length);
        console.log(this.searchResults.points.objects);
        console.log("ROUTES: " + this.searchResults.routes.objects.length);
        console.log(this.searchResults.routes.objects);
        return true;
      } else {
        return false;
      }
    },

    hasSelectedFeaturesInLayersMenu() {
      if (
        this.selectedSearchResultLayers.selectedPoints.length > 0 ||
        this.selectedSearchResultLayers.selectedRoutes.length > 0
      ) {
        return true;
      } else {
        return false;
      }
    }
  },

  watch: {
    // TODO JsDoc
    keepMapCenteredToPosition: function(updatedKeepMapCenteredToPosition) {
      if (
        // TODO Decide between if(condition) and if(condition == true) in whole codebase
        // using == may improve code readibility?
        updatedKeepMapCenteredToPosition == true &&
        this.showPosition.status == false
      ) {
        this.showPosition.status = true;
        this.toggleShowAndUpdatePosition();
      }
    },

    // TODO JsDoc
    showPosition: {
      handler(updatedShowPosition) {
        if (
          updatedShowPosition.status == false &&
          this.keepMapCenteredToPosition == true
        ) {
          this.keepMapCenteredToPosition = false;
        }
      },
      deep: true
    },

    // Remove layers-hash from url when page is resized from mobile to desktop
    // and push it to url when desktop -> mobile (if layers are open when page resizes)
    "$vuetify.breakpoint.mobile"(mobile) {
      if (!mobile && this.$route.hash == "#layers") {
        this.$router.replace("");
        this.dialogLayers = true;
      } else if (mobile && this.dialogLayers == true) {
        this.$router.push("#layers");
      }
    },

    // Monitors url-hashes and toggles dialogs according to hash
    "$route.hash"(newHash, oldHash) {
      if (newHash === "#search") {
        this.dialogSearch = true;
      } else if (oldHash === "#search") {
        this.dialogSearch = false;
      }

      if (newHash === "#layers") {
        this.dialogLayers = true;
      } else if (oldHash === "#layers" && !this.$vuetify.breakpoint.mobile) {
        // Don't do anything, just catch...
        // The idea here is to not close layers if layout changes from mobile to desktop.
        // Only time that there is #layers-hash in desktop, should be when changing
        // from mobile to desktop.
      } else if (oldHash === "#layers") {
        this.dialogLayers = false;
      }

      if (newHash === "#help") {
        this.dialogHelp = true;
      } else if (oldHash === "#help") {
        this.dialogHelp = false;
      }

      if (newHash === "#feature-info") {
        this.dialogVectorFeatureInfo = true;
      } else if (oldHash === "#feature-info") {
        this.dialogVectorFeatureInfo = false;
      }
    }
  },

  methods: {
    // TODO JsDoc
    initOskariChannel: function() {
      var IFRAME_DOMAIN = "https://karttapalvelu.lounaistieto.fi";
      var iFrame = document.getElementById("map");
      /* global OskariRPC */
      var channel = OskariRPC.connect(iFrame, IFRAME_DOMAIN);
      this.channel = channel;
      this.backGroundMaps = backGroundMaps;
      this.renderStructureTEST = renderStructureTEST;
      var findMatchingConfigLayer = this.findMatchingConfigLayer;
      var self = this;

      channel.onReady(function() {
        channel.getAllLayers(function(layers) {
          if (renderStructureTEST.logLayerInfoToConsole) {
            console.log(
              `\nOskarilayers from Karttapalvelu: ${layers.length} layer(s)\n********************************************\n`
            );

            for (const oskariLayer of layers) {
              console.log(`OskariLayer: ${oskariLayer.id} ${oskariLayer.name}`);
            }

            console.log(`\nLayers matching (or not) config-layers:\n`);
            console.log(`***************************************\n`);
          }

          for (const oskariLayer of layers) {
            // Set all layers to not-visible at first
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              oskariLayer.id,
              false
            ]);

            const matchingConfigLayer = (function(oskariLayer) {
              // TODO refactor data structure to real tree (only one root with subContent)?
              // -> can be parsed with just findMatchingConfigLayer(oskariLayer, root)
              // needs also rethinking of parent == null in allParentsVisible-logic
              for (let i = 0; i < self.renderStructureTEST.layers.length; i++) {
                const configLayer = self.renderStructureTEST.layers[i];
                let result = findMatchingConfigLayer(oskariLayer, configLayer);
                if (result != null) {
                  return result;
                }
              }
              return null;
            })(oskariLayer);

            if (matchingConfigLayer != null) {
              if (renderStructureTEST.logLayerInfoToConsole) {
                console.log(
                  `+++ Match for Oskarilayer: ${oskariLayer.id} ${oskariLayer.name}`
                );
              }

              self.setOskariLayerVisibilityAccordingToConfig(
                oskariLayer,
                matchingConfigLayer
              );
            } else {
              if (renderStructureTEST.logLayerInfoToConsole) {
                // TODO add check for backgroundlayers
                console.log(
                  `--- NO MATCH in config-layers for Oskarilayer: ${oskariLayer.id} ${oskariLayer.name}`
                );
              }
            }
          }

          // Show selected background map
          self.toggleBackgroundMaps();
          self.renderStructureTEST.layersLoaded = true;
        });

        channel.handleEvent("AfterMapMoveEvent", function(
          dataAfterMapMovement
        ) {
          // The idea with this event handler is to get better user experience.
          // When keepMapCenteredToPosition is on
          // and user moves the map, it disables keepMapCenteredToPosition
          // (because otherwise next gps-update would move the map back).
          // But if user zooms the map (and while zooming, map may also move a little)
          // keepMapCenteredToPosition is not disabled.
          if (self.keepMapCenteredToPosition) {
            const xDistanceDifferenceAfterPositionUpdate = Math.abs(
              dataAfterMapMovement.centerX -
                self.dataAfterPositionUpdate.coords.longitude
            );
            const yDistanceDifferenceAfterPositionUpdate = Math.abs(
              dataAfterMapMovement.centerY -
                self.dataAfterPositionUpdate.coords.latitude
            );

            if (
              // Most probably user moved the map
              xDistanceDifferenceAfterPositionUpdate != 0 &&
              yDistanceDifferenceAfterPositionUpdate != 0
            ) {
              if (
                // not zoomed
                dataAfterMapMovement.zoom == self.zoomAfterPreviousMapMovement
              ) {
                self.keepMapCenteredToPosition = false;
              } else {
                // zoomed (with some movement)
                channel.getMapBbox(function(bbox) {
                  const bboxWidth = bbox.right - bbox.left;
                  const bboxHeight = bbox.top - bbox.bottom;
                  if (
                    xDistanceDifferenceAfterPositionUpdate > 0.25 * bboxWidth ||
                    yDistanceDifferenceAfterPositionUpdate > 0.25 * bboxHeight
                  ) {
                    self.keepMapCenteredToPosition = false;
                  }
                });
              }
            }
          }
          self.zoomAfterPreviousMapMovement = dataAfterMapMovement.zoom;
        });

        // Handle click events of vector features (show feature info box)
        channel.handleEvent("FeatureEvent", function(data) {
          if (data.operation == "click") {
            self.showInfoForVectorFeature(data);
          }
        });
      });
    },

    /**
     * @description Open or close dialog.
     * Works by adding hash to url so that route-watcher can toggle appropriate dialog.
     * This way dialogs can be opened/closed also with browsers forward/back-button.
     *
     * @param {String} dialog - dialog name as one of the:
     * "search", "layers", "help", "feature-info". This is added to url as eg. url/#search
     * @param {Boolean} open - true to open dialog, false to navigating back
     * ( which may mean closing dialog if there are no other hash-items in history stack
     * or closing dialog and opening other if there are other hash-items in history).
     * For 'just' closing dialog, see closeDialog
     * @returns {Undefined} - Does not return anything
     */
    toggleDialog: function(dialog, open) {
      if (open) {
        this.$router.push("#" + dialog);
        
      } else {
        this.$router.back();
      }
    },

    /**
     * @description Close dialog and remove the hash from url.
     * Doesn't navigate back like toggleDialog("..", false), but instead just closes dialog
     * and clears hash (like it should be in 'main' view).
     * In other words, back-button works with both, but toggleDialog creates 'linear' history:
     * "<empty>" -> "layers" -> "search" (and now backbutton) -> "layers" -> "<empty>"
     * where as close dialog may have root address in the middle of history stack:
     * "<empty>" -> "layers" -> "search" -> "<empty>" (here closeDialog is called) -> "help"
     *
     * @param {String} dialog - dialog name to close as one of the:
     * "search", "layers", "help", "feature-info".
     * @returns {Undefined} - Does not return anything
     */
    closeDialog: function(dialog) {
      if (this.$route.hash == "#feature-info") {
        // (feature-info is different pattern than others)
        this.dialogVectorFeatureInfo = false;
      } else {
        eval("this.dialog" + dialog.charAt(0).toUpperCase() + dialog.slice(1) + "= false") ;
      }
      // #navigation is used just as temporary hash because othervise .replace would replace
      // last real hash and back-button would navigate to one before last one
      this.$router.push("#navigation");
      this.$router.replace("");
    },

    // TODO JsDoc
    showInfoForVectorFeature: function(data) {
      // save data here and refer to it in dialog-template
      this.clickedVectorFeature = data.features[0].geojson.features[0];
      this.toggleDialog("feature-info", true)
      // TODO remove console.logs
      console.log("FeatureEventId: " + data.features[0].id);
      console.log("FeatureLayer: " + data.features[0].layerId);
    },

    /**
     * @description Find config-layer item whose id-property matches
     * oskariLayer parameter (Object.id or number)
     *
     * @param {(Object|number)} oskariLayer - layer item from Oskari iframe (channel.getAllLayers())
     * or layer id number.
     * @param {Object} configLayerItem - layer item from config.js renderStructureTEST.layers
     * @returns {(Object|null)} - configLayerItem if id-values are the same or null otherwise
     */
    findMatchingConfigLayer: function(oskariLayer, configLayerItem) {
      let id = undefined;
      if (typeof oskariLayer === "object") {
        id = oskariLayer.id;
      } else if (typeof oskariLayer === "number") {
        id = oskariLayer;
      }

      if (configLayerItem.id && configLayerItem.id == id) {
        return configLayerItem;
      } else if (
        configLayerItem.subContent &&
        configLayerItem.subContent.length > 0
      ) {
        for (let j = 0; j < configLayerItem.subContent.length; j++) {
          const subItem = configLayerItem.subContent[j];
          const matchResult = this.findMatchingConfigLayer(
            oskariLayer,
            subItem
          );
          if (matchResult != null) {
            return matchResult;
          }
        }
        return null;
      } else {
        return null;
      }
    },

    /**
     * @description Set Oskari-layer visible if it is visible in config (matchingConfigLayer.visible == true).
     *
     * @param {Object} oskariLayer - layer item from Oskari iframe (channel.getAllLayers())
     * @param {Object} matchingConfigLayer - layer item from config.js renderStructureTEST.layers
     * <br> which has same id than oskariLayer
     * @returns {Undefined} - Does not return anything
     */
    setOskariLayerVisibilityAccordingToConfig: function(
      oskariLayer,
      matchingConfigLayer
    ) {
      let channel = this.channel;

      if (matchingConfigLayer.visible) {
        if (matchingConfigLayer.type == "wms") {
          if (
            matchingConfigLayer.renderAs == "checkbox" &&
            matchingConfigLayer.checked &&
            this.allParentsVisible(matchingConfigLayer)
          ) {
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              oskariLayer.id,
              true
            ]);
          } else if (
            matchingConfigLayer.renderAs == "accordion" &&
            this.allParentsVisible(matchingConfigLayer)
          ) {
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              oskariLayer.id,
              true
            ]);
          }
        }
      }
    },

    /**
     * @description Handles functionality of welcome-dialog.
     * Functionality may be (in this order):
     * - open external webpage
     * - call function in App.vue:methods
     * - show wms-layer
     * Welcome-dialog items (and their functionality) are defined in config.js:welcomeContent.items.
     *
     * @param {Object} clickTarget - object in config.js:welcomeContent.items
     * @returns {Undefined} - Does not return anything
     */
    handleWelcomeDialogClick: function(clickTarget) {
      function turnParentsVisible(parentLayer) {
        if (parentLayer != null) {
          parentLayer.visible = true;
          turnParentsVisible(parentLayer.parent);
        }
      }

      if (clickTarget.externalLink.length > 0) {
        // Open external link
        window.open(clickTarget.externalLink, "_blank");
      } else if (clickTarget.internalFunction.length > 0) {
        // Call internal function (like showHelpDialog etc.)
        this[clickTarget.internalFunction]();
        this.dialogWelcome = false;
      } else {
        // Normal wms-layers
        // Turn off (not visible) and uncheck all items in menu structure
        for (let i = 0; i < this.renderStructureTEST.layers.length; i++) {
          const layer = this.renderStructureTEST.layers[i];
          layer.visible = false;
          this.toggleVisibility(layer, true);
        }

        // Find right menu-item (map layer)
        var self = this;
        const matchingConfigLayer = (function(oskariLayer) {
          for (let i = 0; i < self.renderStructureTEST.layers.length; i++) {
            const configLayer = self.renderStructureTEST.layers[i];
            let result = self.findMatchingConfigLayer(oskariLayer, configLayer);
            if (result != null) {
              return result;
            }
          }
          return null;
        })(clickTarget.id);

        // Turn it on (visible)
        if (matchingConfigLayer != null) {
          matchingConfigLayer.visible = true;
          if (matchingConfigLayer.checked != null) {
            matchingConfigLayer.checked = true;
          }
          this.channel.postRequest(
            "MapModulePlugin.MapLayerVisibilityRequest",
            [matchingConfigLayer.id, true]
          );
          // Turn also (all) parents on
          turnParentsVisible(matchingConfigLayer.parent);
        }
        this.dialogWelcome = false;
      }
    },

    // TODO remove or replace with Ohjeet-dialog logic
    showHelpDialog: function() {
      this.dialogWelcome = false;
      this.toggleDialog("help", true);
    },

    /**
     * @description Toggles visibility of layers-menu items ("eye-icon").
     * Travels menu structure recursively downwards if needed.
     *
     * @param {Object} eventTarget item or sub-item in renderStructureTEST.layers (or .subContent)
     * @param {boolean} [toggleCheckBox=false] If true, turns also all checkboxes off (checked=false)
     * This can be used when turning all (or some) item(structure)(s) off programmatically
     * @todo Implement "all checkboxes on" -functionality (toggleCheckBox=true) if needed
     * @returns {Undefined} - Does not return anything
     */
    toggleVisibility: function(eventTarget, toggleCheckBox = false) {
      let channel = this.channel;
      let toggleToVisible = eventTarget.visible;

      function toggleVisibilityOrGoDeeper(item) {
        // NOTE! item refers to layer structure from config, which is separate from actual Oskari-layer items (objects)
        // this also means that item.visible != Oskari-layer item.visible
        // item.visible is for state of application, Oskari-item.visible actually controls visibility (channel.postRequest())
        // Templates v-model also modifies .visible and .checked state
        // (because they control the rendering of eye-icon and checkbox)

        if (item.id) {
          // "Simple items" which are layers themselves
          if (item.type == "wms") {
            if (toggleToVisible) {
              if (item.renderAs == "checkbox" && item.checked) {
                channel.postRequest(
                  "MapModulePlugin.MapLayerVisibilityRequest",
                  [item.id, true]
                );
                item.visible = true;
              } else if (item.renderAs == "accordion") {
                channel.postRequest(
                  "MapModulePlugin.MapLayerVisibilityRequest",
                  [item.id, true]
                );
                item.visible = true;
              }
            } else {
              channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
                item.id,
                false
              ]);
              item.visible = false;
              if (toggleCheckBox && item.checked != null) {
                item.checked = false;
              }
            }
            return;
          } else if (item.type == "wfs") {
            // changeWFSLayerVisibility(layerId, item.visible) // (not implemented yet...)
            return;
          }
        } else if (item.type == "virtual" && item.subContent.length > 0) {
          // "Not so simple items" that has to be travelled
          item.subContent.forEach(function(subItem) {
            toggleVisibilityOrGoDeeper(subItem);
            return;
          });
        }
      }

      toggleVisibilityOrGoDeeper(eventTarget);
    },

    // TODO JsDoc
    toggleChecked: function(eventTarget) {
      // NOTE! item refers to layer structure from config, which is separate from actual Oskari-layer items (objects)
      // this also means that item.visible and Oskari-layer item.visible are not the same setting
      // (even though they reflect each other)
      // item.visible is for state of application, Oskari-item.visible actually controls visibility
      // Templates v-model also modifies .visible and .checked state
      // (because they control the rendering of eye-icon and checkbox)

      let item = eventTarget;
      let channel = this.channel;
      //let toggleToVisible = this.allParentsVisible(item); //tavallaan turha tsekata jos laitetaan pois päältä...
      if (item.id) {
        if (item.type == "wms") {
          if (item.renderAs == "checkbox" && item.checked) {
            if (this.allParentsVisible(item)) {
              // TODO remove console.logs
              console.log(
                "All Parents Visible, ToggleChecked: " + item.checked
              );
              channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
                item.id,
                true
              ]);
              item.visible = true;
            }
          } else if (item.renderAs == "checkbox" && !item.checked) {
            // TODO remove console.logs
            console.log("ToggleChecked: " + item.checked);
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              item.id,
              false
            ]);
            item.visible = false;
          }
          // console.log(
          //   "WMS2: " + item.id + " " + item.name + ", visible:" + item.visible
          // );
        } else {
          // item.type something else
        }
      }
    },

    /**
     * @description Toggles visibility of search results that are added
     * to map using 'show checked search results on map' -functionality
     * (in search results -dialog)
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleVisibilityOfSearchResults: function() {
      if (!this.selectedSearchResultLayers.visible) {
        // Hide Point layers
        this.searchResults.points.selectedResultsPointTypes.forEach(
          pointType => {
            this.channel.postRequest("VectorLayerRequest", [
              { layerId: pointType, opacity: 0 }
            ]);
          }
        );

        // Hide Route layers
        this.searchResults.routes.selectedResultsRouteTypes.forEach(
          routeType => {
            this.channel.postRequest("VectorLayerRequest", [
              { layerId: routeType, opacity: 0 }
            ]);
          }
        );
      } else {
        // Show Point layers
        this.searchResults.points.selectedResultsPointTypes.forEach(
          pointType => {
            this.channel.postRequest("VectorLayerRequest", [
              { layerId: pointType, opacity: 100 }
            ]);
          }
        );

        // Show Route layers
        this.searchResults.routes.selectedResultsRouteTypes.forEach(
          routeType => {
            this.channel.postRequest("VectorLayerRequest", [
              { layerId: routeType, opacity: 100 }
            ]);
          }
        );
      }
    },

    /**
     * @description Shows or hides individual features in selected
     * search results (in layers-menu) according to checkbox state.
     * Because of Oskari restrictions, features are actually added
     * or removed everytime checkbox state changes (instead of hiding/showing).
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleCheckedSearchResult: function(feature) {
      // TODO remove console.logs
      console.log("toggleCheckedSearchResult: " + feature.id);
      console.log("Feature checked: " + feature.checked);
      const featureLayer = this.removeSpaces(feature.properties.class2_fi);
      console.log("featureLayer: " + featureLayer);
      if (feature.checked) {
        // Show feature
        // Oskari needs FeatureCollection object (instead of Feature object)
        const featureCollectionWrapper = {
          type: "FeatureCollection",
          features: [feature]
        };
        if (
          featureCollectionWrapper.features[0].geometry.type == "Point" ||
          featureCollectionWrapper.features[0].geometry.type == "MultiPoint"
        ) {
          // Add MultiPoint
          this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
            featureCollectionWrapper,
            {
              layerId: featureLayer,
              // TODO move to config.js
              featureStyle: {
                image: {
                  shape: 0,
                  size: 3 // Oskari icon size.
                }
              }
            }
          ]);
        } else if (
          featureCollectionWrapper.features[0].geometry.type ==
            "MultiLineString" ||
          featureCollectionWrapper.features[0].geometry.type == "LineString"
        ) {
          // Add MultiLineString
          this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
            featureCollectionWrapper,
            {
              layerId: featureLayer,
              // TODO move to config.js
              featureStyle: {
                stroke: {
                  color: "rgba(235, 174, 52,1)",
                  width: 4
                }
              }
            }
          ]);
        }
      } else {
        // Hide feature
        this.channel.postRequest(
          "MapModulePlugin.RemoveFeaturesFromMapRequest",
          ["id", feature.properties.id, featureLayer]
        );
        // TODO remove console.logs
        console.log("Removed");
      }
    },

    /**
     * @description Handles visibility ("eye icon") of backgroundmaps.
     * Shows selected map and hides others on change of map.
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleBackgroundMaps: function() {
      if (!this.backGroundMaps.visible) {
        // Hide all layers
        // There are only few backgroundlayers so it's ok to do forEach
        // even though we actually would only need to hide selected layer.
        // This way we can be sure that visibility stays in sync.
        this.backGroundMaps.layers.forEach(layer => {
          this.channel.postRequest(
            "MapModulePlugin.MapLayerVisibilityRequest",
            [layer.id, false]
          );
        });
      } else {
        // Show selected layer, hide others
        const selectedMapId = this.backGroundMaps.selected;
        this.backGroundMaps.layers.forEach(layer => {
          if (selectedMapId == layer.id) {
            this.channel.postRequest(
              "MapModulePlugin.MapLayerVisibilityRequest",
              [layer.id, true]
            );
          } else {
            this.channel.postRequest(
              "MapModulePlugin.MapLayerVisibilityRequest",
              [layer.id, false]
            );
          }
        });
      }
    },

    /**
     * @description Travel config.js renderStructureTEST.layers (layers-menu) upwards from configLayerItem
     * and check whether item has parents and are they all visible.
     * Returns early (as soon as a possible non-visible parent is found).
     *
     * @param {Object} configLayerItem - layer item from config.js renderStructureTEST.layers
     * @returns {(true|false)} - true if all items parents are visible (their visible-property == true)
     * <br> true if item does not have parents but is visible itself.
     * <br> false if any of the parents visible-property is false
     */
    allParentsVisible: function(configLayerItem) {
      if (configLayerItem.parent === null) {
        return configLayerItem.visible;
      } else {
        if (configLayerItem.parent.visible) {
          return this.allParentsVisible(configLayerItem.parent);
        } else {
          return false;
        }
      }
    },

    /**
     * @description Set parent pointers for items (and sub-items) in config.js renderStructureTEST.layers
     * (layers-menu). This makes it possible to travel menu-structure upwards to find out
     * whether all items parents are visible (allParentsVisible).
     *
     * @param {Object} node item or sub-item in renderStructureTEST.layers (or .subContent)
     * @returns {Undefined} - Does not return anything
     */
    setParentPointer: function(node) {
      let parent = node;
      // TODO replace hasOwnProperty with something 'allowed'(eslint): property in X maybe?
      // eslint-disable-next-line no-prototype-builtins
      if (node.hasOwnProperty("subContent") && node.subContent.length > 0) {
        node.subContent.forEach(function(subItem) {
          subItem.parent = parent;
          this.setParentPointer(subItem);
          return;
        }, this);
      }
      return;
    },

    // TODO JsDoc
    searchRoutesAndPoints: async function() {
      // TODO handle no-geolocation (don't show any geolocation related components or show error (error is better?))
      this.resetSearchResults();
      this.resetSelectedSearchResults();
      this.removeFeaturesFromVectorLayers();
      this.searchResults.searchOngoing = true;
      this.dialogSearchTabs = 1;

      try {
        if (
          this.searchOptions.selectedRouteOrPoint.length == 0 ||
          this.searchOptions.selectedRouteOrPoint.includes("Reitti")
        ) {
          const routeCQLFilter = await this.getRouteSearchFilters();
          const routesGeoJson = await this.fetchSearchResults(
            encodeURIComponent(routeCQLFilter),
            "Route"
          );
          this.parseSearchResults(routesGeoJson);
        }

        if (
          this.searchOptions.selectedRouteOrPoint.length == 0 ||
          this.searchOptions.selectedRouteOrPoint.includes("Kohde")
        ) {
          const pointCQLFilter = await this.getPointSearchFilters();
          const pointsGeoJson = await this.fetchSearchResults(
            encodeURIComponent(pointCQLFilter),
            "Point"
          );
          this.parseSearchResults(pointsGeoJson);
        }
      } catch (e) {
        // TODO remove console.logs
        console.log(
          // TODO handle network errors (handling now OK, but error message could be better (than eg "404"))
          // TODO handle geoserver errors (are these always actually network errors (404 etc))
          // TODO show error and recover somehow (zero maxDistanceFilter? and let user do a new search without maxDist)
          "ERROR (searchRoutesAndPoints): " + e.name + ": " + e.message
        );
      }

      this.searchResults.searchOngoing = false;
    },

    // TODO JsDoc
    getRouteSearchFilters: async function() {
      const CQLFilterArray = [];

      if (this.searchOptions.searchText) {
        CQLFilterArray.push(this.getFreeTextSearchFilter());
      }
      if (this.searchOptions.selectedRouteTypes.length > 0) {
        CQLFilterArray.push(this.getRouteTypeSearchFilter());
      }
      if (this.searchOptions.selectedMunicipalities.length > 0) {
        CQLFilterArray.push(this.getMunicipalitySearchFilter());
      }
      if (this.searchOptions.maxDistanceFromCurrentLocation) {
        CQLFilterArray.push(
          await this.getMaxDistanceFromLocationSearchFilter()
        );
      }
      if (
        this.searchOptions.routeLengthRange[0] != 0 ||
        this.searchOptions.routeLengthRange[1] != 100
      ) {
        CQLFilterArray.push(this.getRouteLengthFilter());
      }

      // TODO .filter can be removed (but test it) - CQLFilterArray doesn't include falsy elements anymore
      const CQLFilter = CQLFilterArray.filter(Boolean)
        .map(filterComponent => `(${filterComponent})`)
        .join(" AND ");

      // TODO debug, remove
      console.log("CQLFilter ROUTE: " + CQLFilter);
      console.log(
        "urlencoded CQLFilter ROUTE: " + encodeURIComponent(CQLFilter)
      );

      return CQLFilter;
    },

    // TODO JsDoc
    getPointSearchFilters: async function() {
      const CQLFilterArray = [];

      if (this.searchOptions.searchText) {
        CQLFilterArray.push(this.getFreeTextSearchFilter());
      }
      if (this.searchOptions.selectedPointTypes.length > 0) {
        CQLFilterArray.push(this.getPointTypeSearchFilter());
      }
      if (this.searchOptions.selectedMunicipalities.length > 0) {
        CQLFilterArray.push(this.getMunicipalitySearchFilter());
      }
      if (this.searchOptions.maxDistanceFromCurrentLocation) {
        CQLFilterArray.push(
          await this.getMaxDistanceFromLocationSearchFilter()
        );
      }

      // TODO .filter can be removed (but test it) - CQLFilterArray doesn't include falsy elements anymore
      const CQLFilter = CQLFilterArray.filter(Boolean)
        .map(filterComponent => `(${filterComponent})`)
        .join(" AND ");

      // TODO debug, remove
      console.log("CQLFilter POINT: " + CQLFilter);
      console.log(
        "urlencoded CQLFilter POINT: " + encodeURIComponent(CQLFilter)
      );

      return CQLFilter;
    },

    // TODO JsDoc
    getFreeTextSearchFilter: function() {
      return searchConfig.CQLFilters.freeTextFilter(
        this.searchOptions.searchText
      );
    },

    // TODO JsDoc
    getRouteTypeSearchFilter: function() {
      const routeTypeFilterArray = this.searchOptions.selectedRouteTypes.map(
        routeType => searchConfig.CQLFilters.routeTypeFilter(routeType)
      );
      return routeTypeFilterArray.join(" OR ");
    },

    // TODO JsDoc
    getPointTypeSearchFilter: function() {
      const pointTypeFilterArray = this.searchOptions.selectedPointTypes.map(
        pointType => searchConfig.CQLFilters.pointTypeFilter(pointType)
      );
      return pointTypeFilterArray.join(" OR ");
    },

    // TODO JsDoc
    getMunicipalitySearchFilter: function() {
      const municipalityFilterArray = this.searchOptions.selectedMunicipalities.map(
        municipality => searchConfig.CQLFilters.municipalityFilter(municipality)
      );
      return municipalityFilterArray.join(" OR ");
    },

    // TODO JsDoc
    getMaxDistanceFromLocationSearchFilter: async function() {
      // TODO navigator.geolocation.clearWatch if closes search-modal while geolocation (for search!) ongoing
      const distance = this.searchOptions.maxDistanceFromCurrentLocation;
      const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
      };
      const positionWGS84 = await this.getAccuratePositionOnceDEV(
        geolocationOptions
      );
      // TODO loading indicator etc, where do we implement it?
      const positionEPSG3067 = this.transformCoordinates(positionWGS84);

      return searchConfig.CQLFilters.maxDistanceFromLocationFilter(
        positionEPSG3067,
        distance
      );
    },

    // TODO JsDoc
    getRouteLengthFilter: function() {
      const routeLengthFilterArray = [];

      if (this.searchOptions.routeLengthRange[0] != 0) {
        routeLengthFilterArray.push(
          searchConfig.CQLFilters.routeLengthMinFilter(
            this.searchOptions.routeLengthRange[0]
          )
        );
      }
      if (this.searchOptions.routeLengthRange[1] != 100) {
        routeLengthFilterArray.push(
          searchConfig.CQLFilters.routeLengthMaxFilter(
            this.searchOptions.routeLengthRange[1]
          )
        );
      }

      return routeLengthFilterArray.join(" AND ");
    },

    // TODO JsDoc
    fetchSearchResults: function(CQLFilter, type) {
      return new Promise((resolve, reject) => {
        let address = "";
        if (!CQLFilter) {
          if (type == "Route") {
            address = `${searchConfig.baseAddress}${encodeURIComponent(
              searchConfig.geoserverRoutesTypeName
            )}`;
          }
          if (type == "Point") {
            address = `${searchConfig.baseAddress}${encodeURIComponent(
              searchConfig.geoserverPointsTypeName
            )}`;
          }
        } else {
          if (type == "Route") {
            address = `${searchConfig.baseAddress}${encodeURIComponent(
              searchConfig.geoserverRoutesTypeName
            )}&CQL_FILTER=${CQLFilter}`;
          }
          if (type == "Point") {
            address = `${searchConfig.baseAddress}${encodeURIComponent(
              searchConfig.geoserverPointsTypeName
            )}&CQL_FILTER=${CQLFilter}`;
          }

          // address = `${searchConfig.baseAddress}${encodeURIComponent(
          //   searchConfig.geoserverRoutesTypeName
          // )}&CQL_FILTER=${CQLFilter}`;
        }
        // TODO debug, remove
        console.log("address: " + address);

        //fetch("https://reqres.in/api/users/23") // test 404
        fetch(address)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              reject(new Error(response.status));
            }
          })
          .then(result => {
            resolve(result);
          })
          .catch(error => reject(error));
      });
      // TODO loading indicator also for fetchRoute
    },

    /**
     * @description Resets search form.
     *
     * @returns {Undefined} - Does not return anything
     */
    resetSearchForm: function() {
      this.$refs.searchForm.reset();
      this.searchOptions.routeLengthRange = [0, 100];
    },

    /**
     * @description empties search results arrays (points and routes).
     *
     * @returns {Undefined} - Does not return anything
     */
    resetSearchResults: function() {
      // Using splice here in order to Vue recalculating computed property hasSearchResults
      // (https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats)
      this.searchResults.points.objects.splice(0);
      this.searchResults.routes.objects.splice(0);
    },

    /**
     * @description empties selected search results arrays (points and routes).
     *
     * @returns {Undefined} - Does not return anything
     */
    resetSelectedSearchResults: function() {
      this.searchResults.points.selected.splice(0);
      this.searchResults.routes.selected.splice(0);
    },

    /**
     * @description Parse (point vs. routes) Feature collection GeoJSON returned by search.
     * Push features to searchResults array.
     *
     * @param {Object} featureCollection Feature collection GeoJSON
     * @returns {Undefined} - Does not return anything
     */
    parseSearchResults: function(featureCollection) {
      featureCollection.features.map(feature => {
        if (
          feature.geometry.type == "Point" ||
          feature.geometry.type == "MultiPoint"
        ) {
          this.searchResults.points.objects.push(feature);
        }

        if (
          feature.geometry.type == "MultiLineString" ||
          feature.geometry.type == "LineString"
        ) {
          this.searchResults.routes.objects.push(feature);
        }
      });
    },

    /**
     * @description Show selected search results on map as vector layers.
     *
     * @returns {Undefined} - Does not return anything
     */
    showSearchResultsOnMap: function() {
      this.removeFeaturesFromVectorLayers();
      this.findTypesOfSelectedFeatures();
      this.createVectorLayersForSelectedTypes();
      this.addSelectedFeaturesToVectorLayers();
      this.closeDialog('search')
      this.channel.postRequest("MapModulePlugin.ZoomToFeaturesRequest", []);
      this.fillSearchResultsToLayersMenu();
      this.selectedSearchResultLayers.visible = true;
    },

    /**
     * @description Removes spaces from strings.
     *
     * @param {String} input
     * @returns {String} - input string without spaces
     */
    removeSpaces: function(input) {
      return input.split(" ").join("");
    },

    /**
     * @description Removes 'old' features from vector layers for each point and route type.
     *
     * @returns {Undefined} - Does not return anything
     */
    removeFeaturesFromVectorLayers: function() {
      // Remove 'old' features from vector layers for each point and route type
      // (at the time it's not possible to remove whole Oskari-vectorlayers,
      // but there is a feature request ticket for it.)
      // TODO Later it might be good to remove unneeded layers
      this.searchResults.routes.selectedResultsRouteTypes.forEach(routeType => {
        this.channel.postRequest(
          "MapModulePlugin.RemoveFeaturesFromMapRequest",
          [null, null, routeType]
        );
        // TODO remove console.logs
        console.log("RemoveFeaturesFromMapRequest " + routeType);
      });

      this.searchResults.points.selectedResultsPointTypes.forEach(pointType => {
        this.channel.postRequest(
          "MapModulePlugin.RemoveFeaturesFromMapRequest",
          [null, null, pointType]
        );
        // TODO remove console.logs
        console.log("RemoveFeaturesFromMapRequest " + pointType);
      });
    },

    /**
     * @description Finds all point and route types of selected features
     * and pushes them to point and route arrays
     * (selectedResultsRouteTypes, selectedResultsPointTypes).
     *
     * @returns {Undefined} - Does not return anything
     */
    findTypesOfSelectedFeatures: function() {
      this.searchResults.routes.selected.forEach(routeFeature => {
        routeFeature.checked = true;
        const routeFeatureNameWithoutSpaces = this.removeSpaces(
          routeFeature.properties.class2_fi
        );
        if (
          !this.searchResults.routes.selectedResultsRouteTypes.includes(
            routeFeatureNameWithoutSpaces
          )
        ) {
          this.searchResults.routes.selectedResultsRouteTypes.push(
            routeFeatureNameWithoutSpaces
          );
        }
      });

      this.searchResults.points.selected.forEach(pointFeature => {
        pointFeature.checked = true;
        const pointFeatureNameWithoutSpaces = this.removeSpaces(
          pointFeature.properties.class2_fi
        );
        if (
          !this.searchResults.points.selectedResultsPointTypes.includes(
            pointFeatureNameWithoutSpaces
          )
        ) {
          this.searchResults.points.selectedResultsPointTypes.push(
            pointFeatureNameWithoutSpaces
          );
        }
      });
    },

    /**
     * @description Creates vector layers for each point and route type
     * (they may also already exist (because of previous searches),
     * but propably(!? not documented) Oskari does not create several vector layers with same id...)
     *
     * @returns {Undefined} - Does not return anything
     */
    createVectorLayersForSelectedTypes: function() {
      this.searchResults.routes.selectedResultsRouteTypes.forEach(routeType => {
        this.channel.postRequest("VectorLayerRequest", [
          {
            layerId: routeType
          }
        ]);
        console.log("Propably added layer " + routeType);
      });

      this.searchResults.points.selectedResultsPointTypes.forEach(pointType => {
        this.channel.postRequest("VectorLayerRequest", [
          {
            layerId: pointType
          }
        ]);
        // TODO remove console.logs
        console.log("Propably added layer " + pointType);
      });
    },

    /**
     * @description Add selected search result features to vector layers
     *
     * @returns {Undefined} - Does not return anything
     */
    addSelectedFeaturesToVectorLayers: function() {
      this.searchResults.routes.selected.forEach(routeFeature => {
        // Feature can not be removed (by Oskari...) later unless it has some
        // identifying property at Object.properties
        routeFeature.properties.id = routeFeature.id;

        // Oskari needs FeatureCollection object (instead of Feature object)
        const featureCollectionWrapper = {
          type: "FeatureCollection",
          features: [routeFeature]
        };
        // TODO remove console.logs
        console.log(featureCollectionWrapper);

        this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
          featureCollectionWrapper,
          {
            layerId: this.removeSpaces(routeFeature.properties.class2_fi),
            // TODO move to config.js
            featureStyle: {
              stroke: {
                color: "rgba(235, 174, 52,1)",
                width: 8
              }
            }
          }
        ]);
        // TODO remove console.logs
        console.log("Maybe added feature " + routeFeature);
        console.log(
          "... to layer " + this.removeSpaces(routeFeature.properties.class2_fi)
        );
      });

      this.searchResults.points.selected.forEach(pointFeature => {
        // Feature can not be removed (by Oskari...) later unless it has some
        // identifying property at Object.properties
        pointFeature.properties.id = pointFeature.id;

        // Oskari needs FeatureCollection object (instead of Feature object)
        const featureCollectionWrapper = {
          type: "FeatureCollection",
          features: [pointFeature]
        };

        this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
          featureCollectionWrapper,
          {
            layerId: this.removeSpaces(pointFeature.properties.class2_fi),
            // TODO move to config.js
            featureStyle: {
              image: {
                shape: 0,
                //shape: "https://mobile.virma.fi/symbols/Oskari-map-pin.svg",
                size: 3 // Oskari icon size.
                //sizePx: 80, // Exact icon px size. Used if 'size' not defined.
                // offsetX: 0, // image offset x
                // offsetY: 0, // image offset y
                // opacity: 0.7, // image opacity
                // radius: 2 // image radius
                // fill: {
                //   color: "#ff00ff" // image fill color
                // }
              }
            }
          }
        ]);
        // TODO remove console.logs
        console.log("Maybe added feature " + pointFeature);
        console.log(
          "... to layer " + this.removeSpaces(pointFeature.properties.class2_fi)
        );
      });
    },

    /**
     * @description Makes deep copy of selected features (in Search-dialog) and
     * pushes them to selectedSearchResultLayers-arrays (which is also emptied
     * in case there are features from previous function calls).
     *
     * @returns {Undefined} - Does not return anything
     */
    fillSearchResultsToLayersMenu: function() {
      // empty old ones
      this.selectedSearchResultLayers.selectedPoints.splice(0);
      this.selectedSearchResultLayers.selectedRoutes.splice(0);
      this.selectedSearchResultLayers.visible = false;

      this.searchResults.points.selected.forEach(pointFeature => {
        const pointFeatureDeepCopy = JSON.parse(JSON.stringify(pointFeature));
        this.selectedSearchResultLayers.selectedPoints.push(
          pointFeatureDeepCopy
        );
      });

      this.searchResults.routes.selected.forEach(routeFeature => {
        const routeFeatureDeepCopy = JSON.parse(JSON.stringify(routeFeature));
        this.selectedSearchResultLayers.selectedRoutes.push(
          routeFeatureDeepCopy
        );
      });
    },

    /**
     * @description Add new marker to map or move existing marker with same id.
     * Marker is added or moved to given coordinates.
     *
     * @param {Object} positionEPSG3067 object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in EPSG3067 coordinate system
     * @param {String} id id of marker, can be used to reference it later
     * @param {String} color color of marker
     * @returns {Undefined} - Does not return anything
     */
    addMarker: function(positionEPSG3067, id = "marker", color = "#0377fc") {
      // TODO reformat: pass argumets as object eg. id: props.id || "defaultValue"
      // https://stackoverflow.com/questions/27735855/javascript-function-with-optional-parameters-as-object

      let channel = this.channel;
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

    /**
     * @description Remove marker from map.
     *
     * @param {String} id id of marker, can be used to reference it later
     * @returns {Undefined} - Does not return anything
     */
    removeMarker: function(id) {
      let channel = this.channel;
      channel.postRequest("MapModulePlugin.RemoveMarkersRequest", [id]);
    },

    /**
     * @description Move map by centering it to given coordinates.
     *
     * @param {Object} positionEPSG3067 object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in EPSG3067 coordinate system
     * @returns {Undefined} - Does not return anything
     */
    moveMap: function(positionEPSG3067) {
      let channel = this.channel;
      channel.postRequest("MapMoveRequest", [
        positionEPSG3067.coords.longitude,
        positionEPSG3067.coords.latitude
      ]);
    },

    /**
     * @description Toggle browser fullscreen on and off.
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleFullScreen: function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },

    /**
     * @description Transform coordinates in WGS84 to EPSG3067 coordinate system (used by Oskari).
     *
     * @param {Object} positionWGS84 object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in WGS84 coordinate system
     * @returns {Object}  object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in EPSG3067 coordinate system
     * @todo not needed with Oskari native request
     */
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

    /**
     * @description Get position once IN DEVELOPMENT.
     * This function is only for bypassing CORS-header problem while testing locally.
     *
     * @param {Object} positionWGS84 object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in WGS84 coordinate system
     * @returns {Promise}  Promise object which resolves to Geolocation Position -like object (WGS84)
     * which is constructed by hand OR rejects with error if returnError is set to true
     * @todo only needed in local development => remove or comment out
     */
    // eslint-disable-next-line no-unused-vars
    getAccuratePositionOnceDEV: function(options = {}) {
      const returnError = false;

      return new Promise((resolve, reject) => {
        if (returnError) {
          reject(new Error("getAccuratePositionOnceError"));
        } else {
          let position = {};
          position.coords = {};
          position.coords.latitude = 60.568965;
          position.coords.longitude = 21.970356;
          position.coords.accuracy = 150;
          resolve(position);
        }
      });
    },

    /**
     * @description Get position once. Accuracy of returned position will be at least what is defined as parameter.
     *
     * @param {Object} positionWGS84 object which has .coords.latitude and .coords.longitude properties
     * containing coordinates in WGS84 coordinate system
     * @returns {Promise}  Promise object which resolves to Geolocation Position object (WGS84)
     * or rejects with error
     * @todo add accuracy as parameter
     * @todo implement and document timeout and loading indicator
     */
    getAccuratePositionOnce: function(options = {}) {
      return new Promise((resolve, reject) => {
        const id = navigator.geolocation.watchPosition(
          positionWGS84 => {
            if (positionWGS84.coords.accuracy < 200) {
              // TODO loading indicator for waiting position
              // TODO remove console.logs
              console.log("Promise: Good accyracy");
              console.log("Promise: Clearing ID: " + id);
              navigator.geolocation.clearWatch(id);
              resolve(positionWGS84);
            } else {
              // TODO what if accurate position "never" comes - timeout + reject(error)? cancel-by-user-option?
              // TODO debug, remove else when not needed
              console.log(
                "Promise: Poor accyracy: " + positionWGS84.coords.accuracy
              );
            }
          },
          // eslint-disable-next-line no-unused-vars
          error => {
            reject(error);
          },
          options
        );
      });
    },

    /**
     * @description Toggle (controlled by showPosition) between showing
     * (and following, controlled by keepMapCenteredToPosition) or not showing users position.
     *
     * If turned on, will add marker to map, center map once (first gps-position) to user position and
     * keep updating marker position (according to gps-updates).
     * If keepMapCenteredToPosition = true, will also keep map centered to user position (according to gps-updates).
     * If turned off, will remove marker and remove navigator.geolocation.watchPosition (clearWatch).
     *
     * @returns {Undefined} - Does not return anything
     * @todo add accuracy as parameter?
     * @todo add options as parameter with sensible defaults
     * @todo handle errors and not geolocation in navigator
     * @todo implement keepMapRotationNorthUp-functionality
     */
    toggleShowAndUpdatePosition: function() {
      if ("geolocation" in navigator) {
        const self = this;
        const options = {
          // TODO check geolocation options from everywhere (sensible and uniform - general data-prop or config?)
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000
        };

        // Center map to position once (if keepMapCenteredToPosition = false),
        // so user 'finds' herself
        const moveOnce = (function() {
          let zoomed = false;
          return function(positionEPSG3067) {
            if (!zoomed) {
              zoomed = true;
              self.moveMap(positionEPSG3067);
            }
          };
        })();

        // eslint-disable-next-line no-inner-declarations
        function success(positionWGS84) {
          let positionEPSG3067 = self.transformCoordinates(positionWGS84);
          self.addMarker(positionEPSG3067, "trackLocationMarker", "#fc030f");
          moveOnce(positionEPSG3067);

          if (self.keepMapCenteredToPosition) {
            self.dataAfterPositionUpdate = positionEPSG3067;
            self.moveMap(positionEPSG3067);
          }

          if (!self.keepMapRotationNorthUp) {
            // TODO write body (get heading, rotate map)
          }
        }

        // eslint-disable-next-line no-inner-declarations
        function error() {
          // TODO handle errors (by throwing?)
          // TODO remove console.logs
          console.log("no position available");
          alert("Sorry, no position available.");
        }

        self.showPosition.id =
          self.showPosition.status == true
            ? navigator.geolocation.watchPosition(success, error, options)
            : (navigator.geolocation.clearWatch(self.showPosition.id),
              self.removeMarker("trackLocationMarker"));
      } else {
        /* geolocation IS NOT available */
        // TODO handle somehow
        // TODO remove console.logs
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
    },

    // TODO JsDoc
    loadGeoJson: function() {
      // TODO rename and reformat, no fetch here. addSearchFeaturesToMap etc.
      let channel = this.channel;
      let url =
        "https://geoserver.lounaistieto.fi/geoserver/virma/wfs?request=GetFeature&service=WFS&version=1.0.0&typeName=virma%3Avirma_reitit_avoin&outputFormat=application%2Fjson&CQL_FILTER=name_fi%20%3D%20%27Kuuvan%20polku%27";

      // kenttä sisältää:
      // &CQL_FILTER=name_fi%20LIKE%20%27%25Savoj%C3%A4rven%20kierros%25%27

      fetch(url)
        .then(response => response.json())
        .then(result => addVectorLayer(result));

      var options = {
        layerId: "MY_VECTOR_LAYER",
        centerTo: true
      };

      function addVectorLayer(geoJson) {
        channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
          geoJson,
          options
        ]);
      }
    }
  },

  mounted: function() {
    let self = this;
    this.dialogLayers = !this.$vuetify.breakpoint.mobile

    // Ensure in app start that there is no hash in url
    // ( maybe somebody copy-pasted the url or reloaded page when dialog is open )
    if(this.$route.hash != "") {
      this.$router.replace("");
    }

    this.initOskariChannel();

    // Define EPSG3067 coordinate system for proj4.js (coordinate tranforms)
    proj4.defs(
      // TODO remove when geolocation api is not used anymore (but Oskari native requests instead)
      "EPSG:3067",
      "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    );

    // Set parent pointers for layers-menu-items
    this.renderStructureTEST.layers.forEach(function(layer) {
      layer.parent = null; // top-level nodes
      self.setParentPointer(layer);
    });
    this.welcomeContent = welcomeContent;
  },

  created() {
    // Confirm page leave
    window.addEventListener('beforeunload', (event) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';
    });
  }
};
</script>
