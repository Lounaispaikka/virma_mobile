<template>
  <v-app id="inspire">
    <v-app-bar
      clipped-left
      fixed
      app
      color="#58a291"
      dark
      :bottom="$vuetify.breakpoint.xsOnly"
    >
      <v-img
        class="mx-2 d-none d-sm-inline"
        src="@/assets/virma_logo_white.png"
        max-height="50"
        max-width="100"
        contain
      ></v-img>
      <v-toolbar-title class="d-none d-md-flex" style="overflow: visible">
        Kartta
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <span
        style="width: 100%; max-width: 500px"
        class="d-flex justify-space-around"
      >
        <v-btn icon large @click.stop="toggleDialog('search', true)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn
          v-if="!$vuetify.breakpoint.mobile"
          icon
          large
          @click.stop="dialogLayers = !dialogLayers"
        >
          <v-icon>mdi-layers-triple</v-icon>
        </v-btn>

        <v-btn v-else icon large @click.stop="toggleDialog('layers', true)">
          <v-icon>mdi-layers-triple</v-icon>
        </v-btn>

        <v-btn icon large @click="toggleFullScreen">
          <v-icon>mdi-overscan</v-icon>
        </v-btn>

        <v-btn icon large @click.stop="toggleDialog('help', true)">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
      </span>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main class="pt-0 pt-sm-14 pt-md-16 pb-14 pb-sm-0">
      <!-- v-main padding is for fixing Vues 'lazy' reacting for window resize -->
      <v-container class="fill-height" fluid>
        <!-- Geolocation buttons -->
        <div style="position: absolute; bottom: 16px; right: 0; z-index: 1">
          <v-row justify="end" class="ma-0">
            <v-col class="pr-1 pr-sm-3 mb-6">
              <v-btn
                fab
                class="mb-2 no-blur"
                :color="keepMapCenteredToPosition ? 'success' : '#58a291'"
                dark
                style="display: block"
                @click="keepMapCenteredToPosition = !keepMapCenteredToPosition"
              >
                <v-icon>mdi-image-filter-center-focus</v-icon>
              </v-btn>

              <v-btn
                fab
                class="mb-2 no-blur"
                :color="showPosition.status ? 'success' : '#58a291'"
                dark
                style="display: block"
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

        <!-- Zoom buttons -->
        <template v-if="$vuetify.breakpoint.smAndUp">
          <div style="position: absolute; bottom: 256px; right: 0; z-index: 1">
            <v-row justify="end" class="ma-0">
              <v-col class="pr-1 pr-sm-3 mb-6">
                <v-btn
                  fab
                  class="mb-2 no-blur"
                  color="#58a291"
                  dark
                  style="display: block"
                  @click="zoomIn"
                >
                  <v-icon>mdi-magnify-plus</v-icon>
                </v-btn>

                <v-btn
                  fab
                  class="mb-2 no-blur"
                  color="#58a291"
                  dark
                  style="display: block"
                  @click="zoomOut"
                >
                  <v-icon>mdi-magnify-minus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </template>

        <v-row align="center" justify="center">
          <v-col class="text-center">
            <div>
              <iframe
                id="map"
                :src="mapSrc"
                allow="geolocation"
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  bottom: 0;
                  right: 0;
                  width: 100%;
                  height: 100%;
                  border: none;
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                "
              ></iframe>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Layers-dialog Desktop -->
    <template v-if="!$vuetify.breakpoint.mobile">
      <v-navigation-drawer
        v-model="dialogLayers"
        clipped
        app
        width="430"
        class="pr-2 pt-2"
      >
        <template v-if="!layersMenuContent.layersLoaded">
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
              <v-expansion-panel style="backgroundcolor: #eeb1b2">
                <v-expansion-panel-header
                  class="my-0 py-0"
                  :hide-actions="selectedSearchResultCount == 0 ? false : true"
                >
                  <v-container fluid class="ma-0 pa-0">
                    <v-row>
                      <v-col cols="10">
                        <v-checkbox
                          @click.native.stop
                          @change="toggleVisibilityOfSearchResults"
                          v-model="searchResults.visible"
                          on-icon="mdi-eye"
                          off-icon="mdi-eye-off"
                          class="my-0 pb-0 pt-2"
                          style="height: 40px"
                          ><template v-slot:label>
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 250px"
                            >
                              Hakutulokset ( {{ selectedSearchResultCount }} )
                            </span>
                          </template>
                        </v-checkbox>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-expansion-panel-header>
                <v-expansion-panel-content
                  v-if="selectedSearchResultCount == 0"
                >
                  <template>
                    <div class="pl-8">
                      Ei valittuja hakutuloksia.<br />
                      Käytä hakutoimintoa
                      <v-btn
                        color="#58a291"
                        dark
                        fab
                        small
                        depressed
                        class="mx-2"
                        @click.stop="toggleDialog('search', true)"
                        ><v-icon>mdi-magnify</v-icon></v-btn
                      >
                      ja valitse haluamasi tulokset näytettäväksi kartalla.
                    </div>
                  </template>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>

          <!-- Menu-layers -->
          <v-expansion-panels
            class="mb-4 ml-2"
            v-model="layersMenuContent.openOnStartUp"
            multiple
          >
            <!-- Level 0 -->
            <v-expansion-panel
              v-for="(layer, i) in layersMenuContent.layers"
              :key="i"
              :style="layer.style"
              :class="layer.style.class"
            >
              <v-expansion-panel-header
                :expand-icon="layer.subContent.length == 0 ? '' : undefined"
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
                        :class="
                          layer.hasOwnProperty('nameXs') &&
                          layer.nameXs.length > 0
                            ? 'my-0 py-0'
                            : 'my-0 pb-0 pt-2'
                        "
                        style="height: 40px"
                        ><template v-slot:label>
                          <div
                            v-if="
                              layer.hasOwnProperty('nameXs') &&
                              layer.nameXs.length > 0
                            "
                            class="d-inline-block text-truncate"
                            style="max-width: 350px"
                          >
                            <span class="caption">
                              {{ layer.nameXs }}<br />
                            </span>
                            <span>
                              {{ layer.name }}
                            </span>
                            <span
                              v-if="layer.subContent.length > 0"
                              class="pl-3"
                            >
                              ( {{ layer.checkedSubContentCount }} /
                              {{ layer.subContent.length }} )
                            </span>
                          </div>

                          <div
                            v-else
                            class="d-inline-block text-truncate"
                            style="max-width: 350px"
                          >
                            <span>
                              {{ layer.name }}
                            </span>
                            <span
                              v-if="layer.subContent.length > 0"
                              class="pl-3"
                            >
                              ( {{ layer.checkedSubContentCount }} /
                              {{ layer.subContent.length }} )
                            </span>
                          </div>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <div
                  v-if="layer.subContent.length > 1"
                  max-width="100%"
                  class="ml-2 mt-0 py-0"
                >
                  <v-checkbox
                    v-model="layer.checked"
                    @change="selectAllSubContentItems(layer, $event)"
                    class="ml-4 mt-0 py-0"
                  >
                    <template v-slot:label>
                      <div>Valitse kaikki / poista valinnat</div>
                    </template>
                  </v-checkbox>
                </div>
                <div
                  v-for="(item, i) in layer.subContent"
                  :key="i"
                  max-width="100%"
                  class="ml-4 mt-0 py-0"
                >
                  <v-checkbox
                    v-if="item.renderAs == 'checkbox'"
                    v-model="item.checked"
                    @change="toggleChecked(item, layer)"
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
                        max-width="30px"
                        max-height="30px"
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
                          :disabled="item.subContent.length == 0 ? true : false"
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
                                  style="height: 20px"
                                  ><template v-slot:label>
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px"
                                    >
                                      {{ item.name }}
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
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

                            <template v-else-if="subItem.renderAs == 'text'">
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
              <v-expansion-panel style="backgroundcolor: #f7f7f7">
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
                          style="height: 20px"
                          ><template v-slot:label>
                            <span
                              class="d-inline-block text-truncate"
                              style="max-width: 250px"
                            >
                              Taustakartat
                            </span>
                          </template>
                        </v-checkbox>
                      </v-col>
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
                        <v-radio :label="item.name" :value="item.id"></v-radio>
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
          style="min-width: 350px"
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
                <template v-if="!layersMenuContent.layersLoaded">
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
                      <v-expansion-panel style="backgroundcolor: #eeb1b2">
                        <v-expansion-panel-header
                          class="my-0 py-0"
                          :hide-actions="
                            selectedSearchResultCount == 0 ? false : true
                          "
                        >
                          <v-container fluid class="ma-0 pa-0">
                            <v-row>
                              <v-col cols="10">
                                <v-checkbox
                                  @click.native.stop
                                  @change="toggleVisibilityOfSearchResults"
                                  v-model="searchResults.visible"
                                  on-icon="mdi-eye"
                                  off-icon="mdi-eye-off"
                                  class="my-0 pb-0 pt-2"
                                  style="height: 40px"
                                  ><template v-slot:label>
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px"
                                    >
                                      Hakutulokset (
                                      {{ selectedSearchResultCount }} )
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content
                          v-if="selectedSearchResultCount == 0"
                        >
                          <template>
                            <div class="pl-8">
                              Ei valittuja hakutuloksia.<br />
                              Käytä hakutoimintoa
                              <v-btn
                                color="#58a291"
                                dark
                                fab
                                small
                                depressed
                                class="mx-2"
                                @click.stop="toggleDialog('search', true)"
                                ><v-icon>mdi-magnify</v-icon></v-btn
                              >
                              ja valitse haluamasi tulokset näytettäväksi
                              kartalla.
                            </div>
                          </template>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </template>

                  <!-- Menu-layers -->
                  <v-expansion-panels
                    class="mb-4"
                    v-model="layersMenuContent.openOnStartUp"
                    multiple
                  >
                    <!-- Level 0 -->
                    <v-expansion-panel
                      v-for="(layer, i) in layersMenuContent.layers"
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
                                :class="
                                  layer.hasOwnProperty('nameXs') &&
                                  layer.nameXs.length > 0
                                    ? 'my-0 py-0'
                                    : 'my-0 pb-0 pt-2'
                                "
                                style="height: 40px"
                                ><template v-slot:label>
                                  <div
                                    v-if="
                                      layer.hasOwnProperty('nameXs') &&
                                      layer.nameXs.length > 0
                                    "
                                    class="d-inline-block text-truncate"
                                    style="max-width: 350px"
                                  >
                                    <span class="caption">
                                      {{ layer.nameXs }}<br />
                                    </span>
                                    <span>
                                      {{ layer.name }}
                                    </span>
                                    <span
                                      v-if="layer.subContent.length > 0"
                                      class="pl-3"
                                    >
                                      ( {{ layer.checkedSubContentCount }} /
                                      {{ layer.subContent.length }} )
                                    </span>
                                  </div>

                                  <div
                                    v-else
                                    class="d-inline-block text-truncate"
                                    style="max-width: 350px"
                                  >
                                    <span>
                                      {{ layer.name }}
                                    </span>
                                    <span
                                      v-if="layer.subContent.length > 0"
                                      class="pl-3"
                                    >
                                      ( {{ layer.checkedSubContentCount }} /
                                      {{ layer.subContent.length }} )
                                    </span>
                                  </div>
                                </template>
                              </v-checkbox>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-expansion-panel-header>

                      <v-expansion-panel-content>
                        <div
                          v-if="layer.subContent.length > 1"
                          max-width="100%"
                          class="ml-2 mt-0 py-0"
                        >
                          <v-checkbox
                            v-model="layer.checked"
                            @change="selectAllSubContentItems(layer, $event)"
                            class="ml-4 mt-0 py-0"
                          >
                            <template v-slot:label>
                              <div>Valitse kaikki / poista valinnat</div>
                            </template>
                          </v-checkbox>
                        </div>
                        <div
                          v-for="(item, i) in layer.subContent"
                          :key="i"
                          max-width="100%"
                          class="ml-4 mt-0 py-0"
                        >
                          <v-checkbox
                            v-if="item.renderAs == 'checkbox'"
                            v-model="item.checked"
                            @change="toggleChecked(item, layer)"
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
                                max-width="30px"
                                max-height="30px"
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
                                          style="height: 20px"
                                          ><template v-slot:label>
                                            <span
                                              class="
                                                d-inline-block
                                                text-truncate
                                              "
                                              style="max-width: 250px"
                                            >
                                              {{ item.name }}
                                            </span>
                                          </template>
                                        </v-checkbox>
                                      </v-col>
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
                                          v-if="
                                            subItem.hasOwnProperty('legend')
                                          "
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
                      <v-expansion-panel style="backgroundcolor: #f7f7f7">
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
                                  style="height: 20px"
                                  ><template v-slot:label>
                                    <span
                                      class="d-inline-block text-truncate"
                                      style="max-width: 250px"
                                    >
                                      Taustakartat
                                    </span>
                                  </template>
                                </v-checkbox>
                              </v-col>
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
        <v-card style="min-width: 350px">
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title>Hae reittejä ja kohteita</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn
              icon
              @click.stop="
                closeDialog('search');
                zoomToSearchResults();
              "
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>

            <template v-slot:extension>
              <v-tabs
                v-model="dialogSearchTabs"
                background-color="#58a291"
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
                      <template v-if="!layersMenuContent.layersLoaded">
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
                        <v-form
                          ref="searchForm"
                          @submit.prevent="searchRoutesAndPoints"
                        >
                          <v-card-actions class="justify-center mb-4">
                            <v-btn
                              color="success"
                              class="mr-2"
                              width="120px"
                              type="submit"
                            >
                              Hae
                            </v-btn>

                            <v-btn
                              color="warning"
                              width="120px"
                              @click="
                                resetSearchForm();
                                resetSearchResults();
                                resetSelectedSearchResults();
                              "
                            >
                              Tyhjennä
                            </v-btn>
                          </v-card-actions>
                          <v-text-field
                            v-model="searchOptions.searchText"
                            hint="Esim. kuhankuono"
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
                            style="min-height: 48px"
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
                            style="min-height: 48px"
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
                                >Rajoita haku vain valittuihin
                                reittityyppeihin<br />
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
                            style="min-height: 48px"
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
                                  searchOptions.selectedPointTypes.length - 1
                                }}
                                muuta)</span
                              >
                            </template>
                            <template v-slot:message>
                              <span
                                >Rajoita haku vain valittuihin
                                kohdetyyppeihin<br />
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
                            style="min-height: 48px"
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
                                  searchOptions.selectedMunicipalities.length -
                                  1
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

                          <v-subheader class="pl-0" style="font-size: 16px">
                            Etäisyys sijainnistani korkeintaan
                            <span
                              v-if="
                                searchOptions.maxDistanceFromCurrentLocation !=
                                0
                              "
                              style="white-space: pre-wrap"
                              >:
                              {{ searchOptions.maxDistanceFromCurrentLocation }}
                              km
                            </span>
                          </v-subheader>
                          <v-slider
                            v-model="
                              searchOptions.maxDistanceFromCurrentLocation
                            "
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
                            <v-subheader class="pl-0" style="font-size: 16px">
                              Reitin pituus
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] != 0 &&
                                  searchOptions.routeLengthRange[1] != 100
                                "
                                style="white-space: pre-wrap"
                                >: {{ searchOptions.routeLengthRange[0] }} -
                                {{ searchOptions.routeLengthRange[1] }} km
                              </span>
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] == 0 &&
                                  searchOptions.routeLengthRange[1] != 100
                                "
                                style="white-space: pre-wrap"
                                >: alle
                                {{ searchOptions.routeLengthRange[1] }} km
                              </span>
                              <span
                                v-if="
                                  searchOptions.routeLengthRange[0] != 0 &&
                                  searchOptions.routeLengthRange[1] == 100
                                "
                                style="white-space: pre-wrap"
                                >: yli
                                {{ searchOptions.routeLengthRange[0] }} km
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
                      <v-card-actions class="">
                        <v-btn
                          color="warning"
                          class="mt-3"
                          style="z-index: 1"
                          fixed
                          cols="12"
                          @click="resetSelectedSearchResults"
                          :disabled="
                            selectedSearchResultCount > 0 ? false : true
                          "
                        >
                          Tyhjennä valinnat
                        </v-btn>
                      </v-card-actions>

                      <!-- Points -->
                      <v-card
                        color="#bcdad3"
                        class="px-2 pb-2 mt-8"
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
                          v-on:item-selected="searchResultSelected"
                          v-on:toggle-select-all="allSearchResultsSelected"
                          :footer-props="{
                            itemsPerPageText: 'Rivejä yhdellä sivulla',
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

                      <!-- Routes -->
                      <v-card
                        color="#bcdad3"
                        class="px-2 pb-2 mt-4"
                        v-if="searchResults.routes.objects.length > 0"
                      >
                        <v-card-title>
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
                          v-on:item-selected="searchResultSelected"
                          v-on:toggle-select-all="allSearchResultsSelected"
                          :footer-props="{
                            itemsPerPageText: 'Rivejä yhdellä sivulla',
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
      <v-dialog v-model="dialogWelcome" persistent scrollable max-width="700">
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

          <v-card-text style="color: rgba(0, 0, 0, 1)">
            <p>
              Virma Kartan avulla voit tarkastella Varsinais-Suomen
              virkistyskohteita ja -reittejä.<br />
              Voit tutkia reaaliaikaisesti omaa sijaintiasi reitillä tai
              esimerkiksi etsiä lähimmät uimarannat tai matkailupalvelut. Löydät
              palvelusta jo yli 1000 kohdetta, ja määrä kasvaa koko ajan.
            </p>
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
          style="min-width: 350px"
          :min-height="
            $vuetify.breakpoint.smAndUp ? $vuetify.breakpoint.height - 200 : ''
          "
        >
          <v-toolbar flat>
            <v-spacer></v-spacer>
            <v-toolbar-title> Ohjeet </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn icon @click.stop="closeDialog('help')">
              <v-icon>mdi-close</v-icon>
            </v-btn>

            <template v-slot:extension>
              <v-tabs
                v-model="dialogHelpTabs"
                background-color="#58a291"
                dark
                show-arrows
                centered
              >
                <v-tab><v-icon>mdi-shape</v-icon> Toiminnot</v-tab>
                <v-tab><v-icon>mdi-windsock</v-icon> Karttasymbolit</v-tab>
                <v-tab><v-icon>mdi-account-multiple</v-icon> Tekijät</v-tab>
                <v-tab
                  ><v-icon>mdi-sprout</v-icon> Vastuullisen retkeilijän
                  ohjeet</v-tab
                >
              </v-tabs>
            </template>
          </v-toolbar>

          <v-card-text>
            <v-tabs-items v-model="dialogHelpTabs">
              <!-- App functions -->
              <v-tab-item>
                <v-container fluid>
                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="d-flex">
                      <div class="ml-10">
                        <p>
                          Sovellukseen liittyvistä ongelmista voit ilmoittaa
                          osoitteeseen
                          <a href="mailto:virma@lounaistieto.fi"
                            >virma@lounaistieto.fi</a
                          >
                        </p>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#58a291"
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
                      ('ruksi').
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          v-if="!$vuetify.breakpoint.mobile"
                          color="#58a291"
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
                          color="#58a291"
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
                      Kategoriassa näkyvät valittuna olevat alitasot
                      ('ruksi').<br />
                      Hakutoiminnon kautta kartalle lisätyt hakutulokset näkyvät
                      kategoriassa "Hakutulokset"<br />
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#58a291"
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
                        <v-btn color="#58a291" dark fab small depressed>
                          <v-icon>mdi-information-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="10">
                      <p class="font-weight-bold mb-1">Ohjeet</p>
                      Näyttää ohjevalikon.
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="2" class="d-flex">
                      <div class="mx-auto">
                        <v-btn
                          color="#58a291"
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
                          color="#58a291"
                          dark
                          fab
                          small
                          depressed
                          @click="
                            toggleDialog('help', false);
                            keepMapCenteredToPosition =
                              !keepMapCenteredToPosition;
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
                      karttaa, toiminto kytkeytyy automaattisesti pois
                      päältä.<br />
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
                    <v-col cols="2" class="d-flex" align-self="start">
                      <div class="mx-auto">
                        <v-img
                          :src="
                            route.imageName.length == 0
                              ? ''
                              : require(`@/assets/mapsymbols/${route.imageName}`)
                          "
                          :alt="route.key"
                          class="mt-2"
                          max-width="40px"
                          max-height="40px"
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

              <!-- Credits -->
              <v-tab-item>
                <v-container fluid>
                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="d-flex">
                      <p class="text-justify">
                        Virma Kartta -verkkopalvelua sekä virkistysreitteihin ja
                        -kohteisiin liittyviä aineistoja ja palveluita
                        kehitetään
                        <a
                          href="https://www.varsinais-suomi.fi/fi/"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >Varsinais-Suomen liiton</a
                        >,
                        <a
                          href="https://www.lounaistieto.fi/"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >Lounaistiedon</a
                        >,
                        <a
                          href="https://www.valonia.fi/"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >Valonian</a
                        >,
                        <a
                          href="https://lansi-suomi.proagria.fi/"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >ProAgria Länsi-Suomen</a
                        >&nbsp;/
                        <a
                          href="https://lansi-suomi.maajakotitalousnaiset.fi/sisalto/lansi-suomen-maa-ja-kotitalousnaiset-1427"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >Länsi-Suomen maa- ja kotitalousnaisten</a
                        >
                        ja
                        <a
                          href="https://comp.utu.fi"
                          target="_blank"
                          rel="nofollow noreferrer"
                          >Turun yliopiston Tietotekniikan laitoksen</a
                        >
                        yhteistyönä
                        <b
                          >Digitaalisen saavutettavuuden parantaminen
                          virkistyspalveluissa (Digi-SAAPAS) -hankkeessa</b
                        >, jota rahoittaa Varsinais-Suomen ELY-keskus osana
                        Euroopan unionin maaseudun kehittämisohjelmaa. Hanke on
                        käynnisssä vuosina 2020–2022.
                      </p>
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="d-flex">
                      <div class="ml-10">
                        <p>
                          Tiedustelut sovellukseen liittyen:
                          <a href="mailto:virma@lounaistieto.fi"
                            >virma@lounaistieto.fi</a
                          >
                        </p>

                        <p class="text">
                          Lisätietoa Virma-hankkeesta (Digi-SAAPAS) löytyy
                          täältä:
                          <a
                            href="https://valonia.fi/hanke/digitaalisen-saavutettavuuden-parantaminen-virkistyspalveluissa-digi-saapas/"
                            >Valonia</a
                          >,
                          <a href="https://www.lounaistieto.fi/virkistys/"
                            >Lounaistieto</a
                          >,
                          <a href="https://valonia.fi/virmaesite"
                            >Virman esittely</a
                          >
                        </p>
                        <p class="text">
                          Sovelluksen lähdekoodit:
                          <a
                            href="https://github.com/Lounaispaikka/virma_mobile"
                            >Virma Mobile</a
                          >
                        </p>
                      </div>
                    </v-col>
                  </v-row>

                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="d-flex flex-wrap justify-left">
                      <v-img
                        class="tekijalogot"
                        src="@/assets/liitto.svg"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>

                      <v-img
                        class="tekijalogot"
                        src="@/assets/lounaistieto_logo_avoimesti_musta.png"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>
                      <v-img
                        class="tekijalogot"
                        src="@/assets/valonia_logo1_rgb-e1569320033805.png"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>
                      <v-img
                        class="tekijalogot"
                        src="@/assets/maajakotit.jpg"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>
                      <v-img
                        class="tekijalogot"
                        src="@/assets/proagria-lansi-suomi.png"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>
                      <v-img
                        class="tekijalogot"
                        src="@/assets/logo-utu-crop.png"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>

                      <v-img
                        class="tekijalogot"
                        src="@/assets/lippu_ja_tunnuslause-uai-516x81.jpg"
                        max-height="96"
                        max-width="256"
                        contain
                      >
                      </v-img>
                      <v-img
                        class="tekijalogot"
                        src="@/assets/ely_logo.png"
                        max-height="96"
                        max-width="256"
                        contain
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>

              <!-- Vastuullisuus -->
              <v-tab-item>
                <v-container fluid>
                  <v-row class="d-flex align-start">
                    <v-col cols="12" class="">
                      <h1>Vastuullisen retkeilij&auml;n ohjeet&nbsp;</h1>

                      <p>
                        Jokaisella on oikeus
                        nauttia&nbsp;retkeilyst&auml;&nbsp;ja
                        luonnosta!&nbsp;Muistathan kuitenkin huomioida
                        ymp&auml;rist&ouml;&auml;si:&nbsp;
                      </p>

                      <ol>
                        <li>
                          <p>
                            <strong>Kunnioita luontoa&nbsp;</strong
                            >&ndash;&nbsp;esimerkiksi&nbsp;marjoja&nbsp;ja&nbsp;sieni&auml;
                            on mahdollista&nbsp;poimia, mutta
                            &auml;l&auml;&nbsp;vahingoita&nbsp;el&auml;vi&auml;
                            oksia,&nbsp;sammalia,&nbsp;rauhoitettuja&nbsp;kasveja,&nbsp;juuria,&nbsp;maastoa&nbsp;tai
                            h&auml;iritse tarpeettomasti
                            el&auml;imi&auml;.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong
                              >Kunnioita kanssaretkeilij&ouml;it&auml;</strong
                            >
                            &ndash;&nbsp;tee tilaa&nbsp;v&auml;ylill&auml;
                            sek&auml;&nbsp;nuotiopaikalla muillekin.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>Kunnioita maanomistajia</strong> &ndash;
                            pid&auml; riitt&auml;v&auml;
                            et&auml;isyys&nbsp;asuinrakennuksiin,
                            parkkeeraa&nbsp;kulkuv&auml;line&nbsp;maanomistajaa
                            huomioiden&nbsp;ja&nbsp;muista
                            tervehti&auml;&nbsp;kohdatessa.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>Kanna roskat mukanasi </strong
                            >&ndash;&nbsp;vastuullinen retkeilij&auml;
                            vie&nbsp;sen mink&auml; tuo.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong
                              >Sytyt&auml; tuli vain merkitylle paikalle</strong
                            >&nbsp;tai maanomistajan luvalla&nbsp;ja
                            seuraa&nbsp;mets&auml;palovaroituksia.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong
                              >Suosi valmiita polkuja maaston kulumisen
                              ehk&auml;isemiseksi.&nbsp;</strong
                            >Maastopy&ouml;r&auml;ily on sallittua ilman
                            maanomistajan suostumusta, mutta siit&auml; ei saa
                            aiheutua v&auml;h&auml;ist&auml; suurempaa haittaa
                            tai vahinkoa maank&auml;yt&ouml;lle.&nbsp;
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong
                              >Pid&auml; koira&nbsp;tai muu
                              lemmikki&nbsp;kytkettyn&auml;&nbsp;tai
                              v&auml;litt&ouml;m&auml;ss&auml;
                              valvonnassa</strong
                            >&nbsp;vieress&auml;si&nbsp;&ndash;&nbsp;koira voi
                            karata riistan per&auml;&auml;n tai
                            aiheuttaa&nbsp;vahinkoa
                            tai&nbsp;pelkoa&nbsp;kanssaretkeilij&ouml;iss&auml;.&nbsp;
                          </p>
                        </li>
                      </ol>

                      <p>
                        Huomioithan lis&auml;ksi,&nbsp;ett&auml;
                        <strong>luonnonsuojelualueilla</strong>, kuten
                        kansallispuistoissa, jokamiehenoikeudet eiv&auml;t
                        ole&nbsp;sellaisenaan voimassa.&nbsp;Esimerkiksi koirat
                        on pidett&auml;v&auml; aina kytkettyn&auml;&nbsp;ja
                        erillisrajoituksia voi olla voimassa liittyen
                      </p>

                      <ul>
                        <li>sienestykseen</li>
                        <li>marjastukseen</li>
                        <li>kasvien&nbsp;poimintaan</li>
                        <li>kalastukseen</li>
                        <li>tulentekoon</li>
                        <li>leiriytymiseen</li>
                        <li>maastossa&nbsp;ratsastukseen</li>
                        <li>py&ouml;r&auml;ilyyn</li>
                      </ul>
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
  background-color: #bcdad3;
  color: white;
}

.v-data-footer {
  background-color: #bcdad3;
}

.theme--light.v-data-table thead tr th {
  color: white;
}

.no-blur:not(.v-btn--text):not(.v-btn--outlined):hover:before {
  opacity: 0 !important;
}

.tekijalogot {
  margin: 12px;
  padding: 12px;
}
</style>

<script>
import proj4 from "../node_modules/proj4";
import { backGroundMaps } from "./config.js";
import { layersMenuContent } from "./config.js";
import { searchConfig } from "./config.js";
import { mapConfig } from "./config.js";
import { welcomeContent } from "./config.js";
import { helpDialogSymbols } from "./config.js";

export default {
  props: {},

  data: () => ({
    showPosition: { status: false, id: "" },
    keepMapCenteredToPosition: false,
    keepMapRotationNorthUp: true,
    dataAfterPositionUpdate: {},
    zoomAfterPreviousMapMovement: "",
    channel: {},
    mapSrc: mapConfig.mapAddress,
    dialogLayers: false,
    dialogSearch: false,
    dialogVectorFeatureInfo: false,
    clickedVectorFeature: {},
    dialogSearchTabs: null,
    dialogWelcome: true,
    dialogHelp: false,
    dialogHelpTabs: null,
    searchOptions: {
      searchText: "",
      routeOrPoint: ["Reitti", "Kohde"],
      selectedRouteOrPoint: [],
      routeTypes: searchConfig.routeTypes,
      selectedRouteTypes: [],
      pointTypes: searchConfig.pointTypes,
      selectedPointTypes: [],
      municipalities: searchConfig.municipalities,
      selectedMunicipalities: [],
      maxDistanceFromCurrentLocation: "",
      routeLengthRange: [0, 100],
    },
    searchResults: {
      routes: {
        objects: [],
        visible: false,
        selected: [],
        search: "",
        expanded: [],
      },
      points: {
        objects: [],
        visible: false,
        selected: [],
        search: "",
        expanded: [],
      },
      visible: false,
      searchOngoing: false,
      resultHeadersPoints: [
        // for Vuetify data-table
        {
          text: "Kohteen nimi",
          align: "start",
          sortable: false,
          value: "properties.name_fi",
        },
        { text: "Tyyppi", value: "properties.class2_fi" },
        { text: "Sijainti", value: "properties.municipali" },
        { text: "", value: "data-table-expand" },
      ],
      resultHeadersRoutes: [
        // for Vuetify data-table
        {
          text: "Reitin nimi",
          align: "start",
          sortable: false,
          value: "properties.name_fi",
        },
        {
          text: "Pituus",
          value: "properties.length_m",
          formatter: (len) => (len / 1000).toFixed(1) + " km",
        },
        { text: "Sijainti", value: "properties.municipali" },
        { text: "", value: "data-table-expand" },
      ],
    },
    backGroundMaps: {}, // loaded from config.js
    layersMenuContent: {}, // loaded from config.js
    welcomeContent: {}, // loaded from config.js in mounted-property
    helpDialogSymbols: helpDialogSymbols,
  }),

  computed: {
    hasSearchResults() {
      if (
        this.searchResults.points.objects.length > 0 ||
        this.searchResults.routes.objects.length > 0
      ) {
        return true;
      } else {
        return false;
      }
    },

    selectedSearchResultCount() {
      return (
        this.searchResults.points.selected.length +
        this.searchResults.routes.selected.length
      );
    },
  },

  watch: {
    // NOTE: In addition to watchers here, there are also dynamic watchers added in
    // mounted-hook (setCheckedWatcher)

    keepMapCenteredToPosition: function (updatedKeepMapCenteredToPosition) {
      if (
        updatedKeepMapCenteredToPosition == true &&
        this.showPosition.status == false
      ) {
        this.showPosition.status = true;
        this.toggleShowAndUpdatePosition();
      }
    },

    showPosition: {
      handler(updatedShowPosition) {
        if (
          updatedShowPosition.status == false &&
          this.keepMapCenteredToPosition == true
        ) {
          this.keepMapCenteredToPosition = false;
        }
      },
      deep: true,
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
    },
  },

  methods: {
    /**
     * @description Initializes the application and creates Oskari iFrame
     *
     * @returns {Undefined} - Does not return anything
     */
    initOskariChannel: function () {
      var IFRAME_DOMAIN = "https://karttapalvelu.lounaistieto.fi";
      var iFrame = document.getElementById("map");
      /* global OskariRPC */
      var channel = OskariRPC.connect(iFrame, IFRAME_DOMAIN);
      this.channel = channel;
      this.backGroundMaps = backGroundMaps;
      this.layersMenuContent = layersMenuContent;
      var findMatchingConfigLayer = this.findMatchingConfigLayer;
      var self = this;

      channel.onReady(function () {
        channel.getAllLayers(function (layers) {
          if (layersMenuContent.logLayerInfoToConsole) {
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
              false,
            ]);

            const matchingConfigLayer = (function (oskariLayer) {
              for (let i = 0; i < self.layersMenuContent.layers.length; i++) {
                const configLayer = self.layersMenuContent.layers[i];
                let result = findMatchingConfigLayer(oskariLayer, configLayer);
                if (result != null) {
                  return result;
                }
              }
              return null;
            })(oskariLayer);

            if (matchingConfigLayer != null) {
              if (layersMenuContent.logLayerInfoToConsole) {
                console.log(
                  `+++ Match for Oskarilayer: ${oskariLayer.id} ${oskariLayer.name}`
                );
              }

              self.setOskariLayerVisibilityAccordingToConfig(
                oskariLayer,
                matchingConfigLayer
              );
            } else {
              if (layersMenuContent.logLayerInfoToConsole) {
                console.log(
                  `--- NO MATCH in config-layers for Oskarilayer: ${oskariLayer.id} ${oskariLayer.name} (may still be background map)`
                );
              }
            }
          }

          // Show selected background map
          self.toggleBackgroundMaps();
          self.layersMenuContent.layersLoaded = true;
        });

        channel.handleEvent(
          "AfterMapMoveEvent",
          function (dataAfterMapMovement) {
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
                  channel.getMapBbox(function (bbox) {
                    const bboxWidth = bbox.right - bbox.left;
                    const bboxHeight = bbox.top - bbox.bottom;
                    if (
                      xDistanceDifferenceAfterPositionUpdate >
                        0.25 * bboxWidth ||
                      yDistanceDifferenceAfterPositionUpdate > 0.25 * bboxHeight
                    ) {
                      self.keepMapCenteredToPosition = false;
                    }
                  });
                }
              }
            }
            self.zoomAfterPreviousMapMovement = dataAfterMapMovement.zoom;
          }
        );

        // Handle click events of vector features (show feature info box)
        channel.handleEvent("FeatureEvent", function (data) {
          if (data.operation == "click") {
            self.showInfoForVectorFeature(data);
          }
        });
      });
    },

    /**
     * @description Zoom map in
     * Used for desktop zoom buttons.
     *
     * @returns {Undefined} - Does not return anything
     */
    zoomIn: function () {
      this.channel.zoomIn(function () {
        // Oskari needs a callback even if it's empty...
      });
    },

    /**
     * @description Zoom map out
     * Used for desktop zoom buttons.
     *
     * @returns {Undefined} - Does not return anything
     */
    zoomOut: function () {
      this.channel.zoomOut(function () {
        // Oskari needs a callback even if it's empty...
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
    toggleDialog: function (dialog, open) {
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
    closeDialog: function (dialog) {
      if (this.$route.hash == "#feature-info") {
        // (feature-info is different pattern than others)
        this.dialogVectorFeatureInfo = false;
      } else {
        eval(
          "this.dialog" +
            dialog.charAt(0).toUpperCase() +
            dialog.slice(1) +
            "= false"
        );
      }
      // #navigation is used just as temporary hash because othervise .replace would replace
      // last real hash and back-button would navigate to one before last one
      this.$router.push("#navigation");
      this.$router.replace("");
    },

    /**
     * @description Shows info box for vector feature (search result feature)
     *
     * @param {Object} data - Object in search results
     * @returns {Undefined} - Does not return anything
     */
    showInfoForVectorFeature: function (data) {
      console.log(data);
      // save data here and refer to it in dialog-template
      this.clickedVectorFeature = data.features[0].geojson.features[0];
      this.toggleDialog("feature-info", true);
    },

    /**
     * @description Find config-layer item whose id-property matches
     * oskariLayer parameter (Object.id or number)
     *
     * @param {(Object|number)} oskariLayer - layer item from Oskari iframe (channel.getAllLayers())
     * or layer id number.
     * @param {Object} configLayerItem - layer item from config.js layersMenuContent.layers
     * @returns {(Object|null)} - configLayerItem if id-values are the same or null otherwise
     */
    findMatchingConfigLayer: function (oskariLayer, configLayerItem) {
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
     * @param {Object} matchingConfigLayer - layer item from config.js layersMenuContent.layers
     * <br> which has same id than oskariLayer
     * @returns {Undefined} - Does not return anything
     */
    setOskariLayerVisibilityAccordingToConfig: function (
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
              true,
            ]);
          } else if (
            matchingConfigLayer.renderAs == "accordion" &&
            this.allParentsVisible(matchingConfigLayer)
          ) {
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              oskariLayer.id,
              true,
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
    handleWelcomeDialogClick: function (clickTarget) {
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
        for (let i = 0; i < this.layersMenuContent.layers.length; i++) {
          const layer = this.layersMenuContent.layers[i];
          layer.visible = false;
          this.toggleVisibility(layer, true);
        }

        // Find right menu-item (map layer)
        var self = this;
        const matchingConfigLayer = (function (oskariLayer) {
          for (let i = 0; i < self.layersMenuContent.layers.length; i++) {
            const configLayer = self.layersMenuContent.layers[i];
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

    /**
     * @description Used in config.js to open help dialog from welcome dialog
     *
     * @returns {Undefined} - Does not return anything
     */
    showHelpDialog: function () {
      this.dialogWelcome = false;
      this.toggleDialog("help", true);
    },

    /**
     * @description Toggles visibility of layers-menu items ("eye-icon").
     * Travels menu structure recursively downwards if needed.
     *
     * @param {Object} eventTarget item or sub-item in layersMenuContent.layers (or .subContent)
     * @param {boolean} [toggleCheckBox=false] If true, turns also all checkboxes off (checked=false)
     * This can be used when turning all (or some) item(structure)(s) off programmatically
     * @returns {Undefined} - Does not return anything
     */
    toggleVisibility: function (eventTarget, toggleCheckBox = false) {
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
                false,
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
          item.subContent.forEach(function (subItem) {
            toggleVisibilityOrGoDeeper(subItem);
            return;
          });
        }
      }

      toggleVisibilityOrGoDeeper(eventTarget);
    },

    /**
     * @description Toggles visibility of layers-menu items ("checkbox").
     *
     * @param {Object} eventTarget checked (or unchecked) menu item
     * @param {Object} layer layer in layersMenuContent.layers which holds eventTarget
     * @returns {Undefined} - Does not return anything
     */
    toggleChecked: function (eventTarget, layer) {
      // NOTE! item refers to layer structure from config, which is separate from actual Oskari-layer items (objects)
      // this also means that item.visible and Oskari-layer item.visible are not the same setting
      // (even though they reflect each other)
      // item.visible is for state of application, Oskari-item.visible actually controls visibility
      // Templates v-model also modifies .visible and .checked state
      // (because they control the rendering of eye-icon and checkbox)
      // Also controls the state of Select / deselect all -checkbox
      // (checked when all subContent items are checked, not checked othervise)

      let item = eventTarget;
      let channel = this.channel;
      if (item.id) {
        if (item.type == "wms") {
          if (item.renderAs == "checkbox" && item.checked) {
            // Check 'select all' if all subcontent is checked
            if (this.allSubContentSelected(layer)) {
              layer.checked = true;
            }

            if (this.allParentsVisible(item)) {
              channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
                item.id,
                true,
              ]);
              item.visible = true;
            }
          } else if (item.renderAs == "checkbox" && !item.checked) {
            channel.postRequest("MapModulePlugin.MapLayerVisibilityRequest", [
              item.id,
              false,
            ]);
            item.visible = false;

            // Uncheck 'select all' if some (or  all) of subcontent is unchecked
            layer.checked = false;
          }
        } else {
          // item.type something else
        }
      }
    },

    /**
     * @description Selects (checks) or deselects all menu-layers subContent items
     *
     * @param {Object} layer - layer item from config.js layersMenuContent.layers
     * @param {Object} event - Vue change event for getting checkbox state
     * @returns {Undefined} - Does not return anything
     */
    selectAllSubContentItems: function (layer, event) {
      if (event == true) {
        layer.subContent.forEach((item) => {
          item.checked = true;
          this.toggleChecked(item, layer);
        });
      } else {
        layer.subContent.forEach((item) => {
          item.checked = false;
          this.toggleChecked(item, layer);
        });
      }
    },

    /**
     * @description Checks if all layers subContent items are selected (checked).
     * Returns early (as soon as subContent item that is not checked, is found).
     *
     * @param {Object} layer - layer item from config.js layersMenuContent.layers
     * @returns {Boolean} - returns false if any or all subContent item is not checked,
     * and true if all are checked
     */
    allSubContentSelected: function (layer) {
      for (let item of layer.subContent) {
        if (!item.checked) {
          return false;
        }
      }
      return true;
    },

    /**
     * @description Toggles visibility of search results that are added
     * to map (checked in search results -dialog)
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleVisibilityOfSearchResults: function () {
      if (!this.searchResults.visible) {
        // Hide Point layers
        this.channel.postRequest("VectorLayerRequest", [
          { layerId: "selectedSearchResultPoints", opacity: 0 },
        ]);

        // Hide Route layers selectedSearchResultPoints
        this.channel.postRequest("VectorLayerRequest", [
          { layerId: "selectedSearchResultRoutes", opacity: 0 },
        ]);
      } else {
        // Show Point layers
        this.channel.postRequest("VectorLayerRequest", [
          { layerId: "selectedSearchResultPoints", opacity: 100 },
        ]);

        // Show Route layers
        this.channel.postRequest("VectorLayerRequest", [
          { layerId: "selectedSearchResultRoutes", opacity: 100 },
        ]);
      }
    },

    /**
     * @description Shows or hides individual features selected in
     * search results according to checkbox state.
     * Because of Oskari restrictions, features are actually added
     * or removed everytime checkbox state changes (instead of hiding/showing).
     *
     * @returns {Undefined} - Does not return anything
     */
    searchResultSelected: function (eventPayload) {
      let selectedItem = eventPayload.item;

      // Oskari needs FeatureCollection object (instead of Feature object)
      const featureCollectionWrapper = {
        type: "FeatureCollection",
        features: [selectedItem],
      };

      // Item checked in search results table -> show it
      if (eventPayload.value == true) {
        // Feature can not be removed (by Oskari...) later unless it has some
        // identifying property at Object.properties
        selectedItem.properties.id = selectedItem.id;

        if (
          featureCollectionWrapper.features[0].geometry.type == "Point" ||
          featureCollectionWrapper.features[0].geometry.type == "MultiPoint"
        ) {
          this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
            featureCollectionWrapper,
            {
              layerId: "selectedSearchResultPoints",
              featureStyle: {
                image: {
                  shape: 2,
                  //shape: "https://mobile.virma.fi/symbols/Oskari-map-pin.svg", // external icon can be used
                  size: 4, // Oskari icon size.
                  //sizePx: 80, // Exact icon px size. Used if 'size' not defined.
                  // offsetX: 0, // image offset x
                  // offsetY: 0, // image offset y
                  // opacity: 0.7, // image opacity
                  // radius: 2 // image radius
                  fill: {
                    color: "rgba(255, 0, 0, 0.7)", // image fill color
                  },
                },
              },
            },
          ]);
        } else if (
          featureCollectionWrapper.features[0].geometry.type ==
            "MultiLineString" ||
          featureCollectionWrapper.features[0].geometry.type == "LineString"
        ) {
          this.channel.postRequest("MapModulePlugin.AddFeaturesToMapRequest", [
            featureCollectionWrapper,
            {
              layerId: "selectedSearchResultRoutes",
              featureStyle: {
                stroke: {
                  color: "rgba(255, 0, 0, 0.7)",
                  width: 12,
                  lineDash: "solid", // supported options: dash, dashdot, dot, longdash, longdashdot and solid
                  lineCap: "round", // supported options: mitre, round and square
                },
              },
            },
          ]);
        }

        this.searchResults.visible = true;
      } else {
        // Item unchecked in search results table -> hide it
        let layerId;

        if (
          featureCollectionWrapper.features[0].geometry.type == "Point" ||
          featureCollectionWrapper.features[0].geometry.type == "MultiPoint"
        ) {
          layerId = "selectedSearchResultPoints";
        } else if (
          featureCollectionWrapper.features[0].geometry.type ==
            "MultiLineString" ||
          featureCollectionWrapper.features[0].geometry.type == "LineString"
        ) {
          layerId = "selectedSearchResultRoutes";
        }

        this.channel.postRequest(
          "MapModulePlugin.RemoveFeaturesFromMapRequest",
          ["id", selectedItem.properties.id, layerId]
        );
      }
    },

    /**
     * @description Shows or hides all features selected in
     * search results according to select all -checkbox state.
     *
     * @returns {Undefined} - Does not return anything
     */
    allSearchResultsSelected: function (eventPayload) {
      let selectionState = eventPayload.value;
      eventPayload.items.forEach((selectedItem) => {
        let singleItemObject = {};
        singleItemObject.item = selectedItem;
        singleItemObject.value = selectionState;
        this.searchResultSelected(singleItemObject);
      });
    },

    /**
     * @description Zooms to search results (Oskari vector features).
     *
     * @returns {Undefined} - Does not return anything
     */
    zoomToSearchResults: function () {
      this.channel.postRequest("MapModulePlugin.ZoomToFeaturesRequest", []);
    },

    /**
     * @description Handles visibility ("eye icon") of backgroundmaps.
     * Shows selected map and hides others on change of map.
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleBackgroundMaps: function () {
      if (!this.backGroundMaps.visible) {
        // Hide all layers
        // There are only few backgroundlayers so it's ok to do forEach
        // even though we actually would only need to hide selected layer.
        // This way we can be sure that visibility stays in sync.
        this.backGroundMaps.layers.forEach((layer) => {
          this.channel.postRequest(
            "MapModulePlugin.MapLayerVisibilityRequest",
            [layer.id, false]
          );
        });
      } else {
        // Show selected layer, hide others
        const selectedMapId = this.backGroundMaps.selected;
        this.backGroundMaps.layers.forEach((layer) => {
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
     * @description Travel config.js layersMenuContent.layers (layers-menu) upwards from configLayerItem
     * and check whether item has parents and are they all visible.
     * Returns early (as soon as a possible non-visible parent is found).
     *
     * @param {Object} configLayerItem - layer item from config.js layersMenuContent.layers
     * @returns {(true|false)} - true if all items parents are visible (their visible-property == true)
     * true if item does not have parents but is visible itself.
     * false if any of the parents visible-property is false
     */
    allParentsVisible: function (configLayerItem) {
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
     * @description Set parent pointers for items (and sub-items) in config.js layersMenuContent.layers
     * (layers-menu). This makes it possible to travel menu-structure upwards to find out
     * whether all items parents are visible (allParentsVisible). Used in mounted-hook.
     *
     * @param {Object} node item or sub-item in layersMenuContent.layers (or .subContent)
     * @returns {Undefined} - Does not return anything
     */
    setParentPointer: function (node) {
      let parent = node;
      // eslint-disable-next-line no-prototype-builtins
      if (node.hasOwnProperty("subContent") && node.subContent.length > 0) {
        node.subContent.forEach(function (subItem) {
          subItem.parent = parent;
          this.setParentPointer(subItem);
          return;
        }, this);
      }
      return;
    },

    /**
     * @description Set Vue watchers for checkbox items in config.js layersMenuContent.layers
     * (layers-menu). These watchers then update the count (checkedSubContentCount property)
     * for checked items (which is visible in menu). Used in mounted-hook.
     *
     * @param {Object} node item in layersMenuContent.layers
     * @returns {Undefined} - Does not return anything
     */
    setCheckedWatcher: function (node) {
      const self = this;
      // eslint-disable-next-line no-prototype-builtins
      if (node.hasOwnProperty("subContent") && node.subContent.length > 0) {
        node.checkedSubContentCount = 0;

        node.subContent.forEach(function (subItem) {
          if (subItem.id) {
            if (subItem.type == "wms") {
              if (subItem.renderAs == "checkbox") {
                self.$watch(
                  function () {
                    return subItem.checked;
                  },
                  function (newValue) {
                    if (newValue == true) {
                      node.checkedSubContentCount++;
                    } else {
                      node.checkedSubContentCount--;
                    }
                  }
                );

                if (subItem.checked) {
                  node.checkedSubContentCount++;
                }
              }
            }
          }
        });
      }
    },

    /**
     * @description Main method for search functionality
     *
     * @returns {Undefined} - Does not return anything
     */
    searchRoutesAndPoints: async function () {
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
        // console.log(
        //   // TODO handle network errors (handling now OK, but error message could be better (than eg "404"))
        //   // TODO handle geoserver errors (are these always actually network errors (404 etc))
        //   // TODO show error and recover somehow (zero maxDistanceFilter? and let user do a new search without maxDist)
        //   "ERROR (searchRoutesAndPoints): " + e.name + ": " + e.message
        // );
      }

      this.searchResults.searchOngoing = false;
    },

    /**
     * @description Collects all route search filters from search form
     * and combines them to CQL-filter string ready to be sent to Geosever
     *
     * @returns {String} - CQLFilter
     */
    getRouteSearchFilters: async function () {
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

      const CQLFilter = CQLFilterArray.filter(Boolean)
        .map((filterComponent) => `(${filterComponent})`)
        .join(" AND ");

      // TODO debug, remove when within-filter works
      // console.log("CQLFilter ROUTE: " + CQLFilter);
      // console.log(
      //   "urlencoded CQLFilter ROUTE: " + encodeURIComponent(CQLFilter)
      // );

      return CQLFilter;
    },

    /**
     * @description Collects all point search filters from search form
     * and combines them to CQL-filter string ready to be sent to Geosever
     *
     * @returns {String} - CQLFilter
     */
    getPointSearchFilters: async function () {
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

      const CQLFilter = CQLFilterArray.filter(Boolean)
        .map((filterComponent) => `(${filterComponent})`)
        .join(" AND ");

      // TODO debug, remove when within-filter works
      // console.log("CQLFilter POINT: " + CQLFilter);
      // console.log(
      //   "urlencoded CQLFilter POINT: " + encodeURIComponent(CQLFilter)
      // );

      return CQLFilter;
    },

    /**
     * @description Get CQL Filter for free text search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getFreeTextSearchFilter: function () {
      return searchConfig.CQLFilters.freeTextFilter(
        this.searchOptions.searchText
      );
    },

    /**
     * @description Get CQL Filter for route type search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getRouteTypeSearchFilter: function () {
      const routeTypeFilterArray = this.searchOptions.selectedRouteTypes.map(
        (routeType) => searchConfig.CQLFilters.routeTypeFilter(routeType)
      );
      return routeTypeFilterArray.join(" OR ");
    },

    /**
     * @description Get CQL Filter for point type search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getPointTypeSearchFilter: function () {
      const pointTypeFilterArray = this.searchOptions.selectedPointTypes.map(
        (pointType) => searchConfig.CQLFilters.pointTypeFilter(pointType)
      );
      return pointTypeFilterArray.join(" OR ");
    },

    /**
     * @description Get CQL Filter for municipality search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getMunicipalitySearchFilter: function () {
      const municipalityFilterArray =
        this.searchOptions.selectedMunicipalities.map((municipality) =>
          searchConfig.CQLFilters.municipalityFilter(municipality)
        );
      return municipalityFilterArray.join(" OR ");
    },

    /**
     * @description Get CQL Filter for max distance from users current location search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getMaxDistanceFromLocationSearchFilter: async function () {
      const distance = this.searchOptions.maxDistanceFromCurrentLocation;
      const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      };
      const positionWGS84 = await this.getAccuratePositionOnceDEV(
        geolocationOptions
      );
      const positionEPSG3067 = this.transformCoordinates(positionWGS84);

      return searchConfig.CQLFilters.maxDistanceFromLocationFilter(
        positionEPSG3067,
        distance
      );
    },

    /**
     * @description Get CQL Filter for route length search option.
     *
     * @returns {String} - CQLFiltertext
     */
    getRouteLengthFilter: function () {
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

    /**
     * @description Makes a search query to Geoserver
     *
     * @param {String} CQLFilter - CQL filter to be used in query
     * @param {String} type - either "Route" or "Point"
     * @returns {Json} - Geoserver response Feature collection GeoJSON
     */
    fetchSearchResults: function (CQLFilter, type) {
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
        }
        // TODO debug, remove
        // console.log("address: " + address);

        //fetch("https://reqres.in/api/users/23") // test 404
        fetch(address)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              reject(new Error(response.status));
            }
          })
          .then((result) => {
            resolve(result);
          })
          .catch((error) => reject(error));
      });
    },

    /**
     * @description Resets search form.
     *
     * @returns {Undefined} - Does not return anything
     */
    resetSearchForm: function () {
      this.$refs.searchForm.reset();
      this.searchOptions.routeLengthRange = [0, 100];
    },

    /**
     * @description empties search results arrays (points and routes).
     *
     * @returns {Undefined} - Does not return anything
     */
    resetSearchResults: function () {
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
    resetSelectedSearchResults: function () {
      this.searchResults.points.selected.splice(0);
      this.searchResults.routes.selected.splice(0);
      this.removeFeaturesFromVectorLayers();
    },

    /**
     * @description Parse (point vs. routes) Feature collection GeoJSON returned by search.
     * Push features to searchResults array.
     *
     * @param {Object} featureCollection Feature collection GeoJSON
     * @returns {Undefined} - Does not return anything
     */
    parseSearchResults: function (featureCollection) {
      featureCollection.features.map((feature) => {
        if (
          feature.geometry &&
          (feature.geometry.type == "Point" ||
            feature.geometry.type == "MultiPoint")
        ) {
          this.searchResults.points.objects.push(feature);
        }

        if (
          feature.geometry &&
          (feature.geometry.type == "MultiLineString" ||
            feature.geometry.type == "LineString")
        ) {
          //TODO: Move
          this.searchResults.routes.objects.push(feature);
        }
      });
    },

    /**
     * @description Remove all features from point and route vector layers.
     *
     * @returns {Undefined} - Does not return anything
     */
    removeFeaturesFromVectorLayers: function () {
      this.channel.postRequest("MapModulePlugin.RemoveFeaturesFromMapRequest", [
        null,
        null,
        "selectedSearchResultPoints",
      ]);

      this.channel.postRequest("MapModulePlugin.RemoveFeaturesFromMapRequest", [
        null,
        null,
        "selectedSearchResultRoutes",
      ]);
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
    addMarker: function (positionEPSG3067, id = "marker", color = "#0377fc") {
      let channel = this.channel;
      channel.postRequest("MapModulePlugin.AddMarkerRequest", [
        {
          x: positionEPSG3067.coords.longitude,
          y: positionEPSG3067.coords.latitude,
          color,
          msg: "",
          shape: 5,
          size: 3,
        },
        id,
      ]);
    },

    /**
     * @description Remove marker from map.
     *
     * @param {String} id id of marker, can be used to reference it later
     * @returns {Undefined} - Does not return anything
     */
    removeMarker: function (id) {
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
    moveMap: function (positionEPSG3067) {
      let channel = this.channel;
      channel.postRequest("MapMoveRequest", [
        positionEPSG3067.coords.longitude,
        positionEPSG3067.coords.latitude,
      ]);
    },

    /**
     * @description Toggle browser fullscreen on and off.
     *
     * @returns {Undefined} - Does not return anything
     */
    toggleFullScreen: function () {
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
     */
    transformCoordinates: function (positionWGS84) {
      let positionEPSG3067 = { coords: {} };
      let transform = proj4("EPSG:3067", [
        positionWGS84.coords.longitude,
        positionWGS84.coords.latitude,
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
     */
    // eslint-disable-next-line no-unused-vars
    getAccuratePositionOnceDEV: function (options = {}) {
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
     */
    getAccuratePositionOnce: function (options = {}) {
      return new Promise((resolve, reject) => {
        const id = navigator.geolocation.watchPosition(
          (positionWGS84) => {
            if (positionWGS84.coords.accuracy < 200) {
              navigator.geolocation.clearWatch(id);
              resolve(positionWGS84);
            } else {
              // TODO what if accurate position "never" comes - timeout + reject(error)? cancel-by-user-option?
              // console.log(
              //   "Promise: Poor accyracy: " + positionWGS84.coords.accuracy
              // );
            }
          },
          // eslint-disable-next-line no-unused-vars
          (error) => {
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
     * @todo handle errors and not geolocation in navigator
     * @todo implement keepMapRotationNorthUp-functionality
     */
    toggleShowAndUpdatePosition: function () {
      if ("geolocation" in navigator) {
        const self = this;
        const options = {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000,
        };

        // Center map to position once (if keepMapCenteredToPosition = false),
        // so user 'finds' herself
        const moveOnce = (function () {
          let zoomed = false;
          return function (positionEPSG3067) {
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
          // console.log("no position available");
        }

        self.showPosition.id =
          self.showPosition.status == true
            ? navigator.geolocation.watchPosition(success, error, options)
            : (navigator.geolocation.clearWatch(self.showPosition.id),
              self.removeMarker("trackLocationMarker"));
      } else {
        /* geolocation IS NOT available */
        // console.log("geolocation IS NOT available");
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
  },

  mounted: function () {
    let self = this;
    this.dialogLayers = !this.$vuetify.breakpoint.mobile;

    // Ensure in app start that there is no hash in url
    // ( maybe somebody copy-pasted the url or reloaded page when dialog is open )
    if (this.$route.hash != "") {
      this.$router.replace("");
    }

    this.initOskariChannel();

    // Define EPSG3067 coordinate system for proj4.js (coordinate tranforms)
    proj4.defs(
      "EPSG:3067",
      "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    );

    // Set parent pointers for layers-menu-items
    // and Vue watchers for checked state of checkbox items (for counting checked menu items)
    this.layersMenuContent.layers.forEach(function (layer) {
      layer.parent = null; // top-level nodes
      self.setParentPointer(layer);
      self.setCheckedWatcher(layer);

      // Initialize Select / deselect all state
      if (self.allSubContentSelected(layer)) {
        layer.checked = true;
      }
    });

    // Create Oskari vector layers for search results to come
    this.channel.postRequest("VectorLayerRequest", [
      { layerId: "selectedSearchResultRoutes" },
    ]);
    this.channel.postRequest("VectorLayerRequest", [
      { layerId: "selectedSearchResultPoints" },
    ]);

    this.welcomeContent = welcomeContent;
  },

  created() {
    // Confirm page leave
    window.addEventListener("beforeunload", (event) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = "";
    });
  },
};
</script>
