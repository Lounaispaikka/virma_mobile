/* eslint-disable no-unused-vars */
export let mapConfig = {
  // Map address (karttaupotuksen osoite)
  mapAddress:
    "https://karttapalvelu.lounaistieto.fi/?lang=fi&uuid=f18aacd7-765a-4b08-8996-8aa0d27eb2a9"
};

export let searchConfig = {
  baseAddress:
    "https://geoserver.lounaistieto.fi/geoserver/virma/wfs?request=GetFeature&service=WFS&version=1.0.0&outputFormat=application%2Fjson&typeName=",
  // Geoserver route layer name to search from (Geoserver-taso, josta hakutoiminto etsii reittejä)
  geoserverRoutesTypeName: "virma:virma_reitit_kooste",

  // Geoserver point layer name to search from (Geoserver-taso, josta hakutoiminto etsii kohteita)
  geoserverPointsTypeName: "virma:virma_kohteet_kooste",
  
  // Search form options (Hakulomakkeen vaihtoehdot)
  // TODO it would be better to get these from database
  // instead of hard coding them here, but that requires keeping database 'tidy'
  routeTypes: [
    "Kulttuuriulkoilureitti",
    "Kuntoreitti",
    "Luontopolku",
    "Matkailureitti",
    "Melontareitti",
    "Pyöräilyreitti",
    "Retkeilyreitti",
    "Retkilatu"
  ],
  pointTypes: [
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

  // SQL-queries used by search (SQL-kyselyt joilla hakutoiminto etsii tietokannasta)
  CQLFilters: {
    // Vapaasanahaku
    freeTextFilter: function(searchText) {
      return `
        name_fi ILIKE '%${searchText}%' OR 
        name_se ILIKE '%${searchText}%' OR 
        name_en ILIKE '%${searchText}%' OR 
        info_fi ILIKE '%${searchText}%' OR 
        info_se ILIKE '%${searchText}%' OR 
        info_en ILIKE '%${searchText}%' OR 
        municipali ILIKE '%${searchText}%'
      `;
    },

    // Reittityyppi
    routeTypeFilter: function(routeType) {
      return `class2_fi = '${routeType}'`;
    },

    // Kohdetyyppi
    pointTypeFilter: function(pointType) {
      return `class2_fi = '${pointType}'`;
    },

    // Sijaintikunta
    municipalityFilter: function(municipality) {
      return `municipali ILIKE '%${municipality}%'`;
    },

    // Etäisyys sijainnistani
    maxDistanceFromLocationFilter: function(location, distance) {
      return `DWITHIN(geom,SRID=3067;POINT(${location.coords.longitude} ${location.coords.latitude}),${distance},kilometers)`;
    },

    // Reitin pituus vähintään
    routeLengthMinFilter: function(value) {
      return `length_m > ${value * 1000}`;
    },

    // Reitin pituus enintään
    routeLengthMaxFilter: function(value) {
      return `length_m < ${value * 1000}`;
    }
  }
};

// Content 'boxes' for welcome dialog (Tervetuloa-ikkunan sisältölaatikot)
export let welcomeContent = {
  defaultBgColor: "#26c6da",
  cardHeight: "200px",
  items: [
    {
      name: "Retkeilyreitit", // Text which is shown on top of the 'box'
      id: 1304, // layer id:s are logged to console when layersMenuContent:logLayerInfoToConsole = true
      // columnWidth uses 12-point grid (https://vuetifyjs.com/en/components/grids/) where 12 is full width, 6 is half width etc.
      columnWidth: 12, // on xs (<600px) always 12, this overrides when >600px
      bgColor: "", // overrides defaultBgColor if set, use hex code ('#26c6da')
      imageName: "Hierkonpolku_DSC_9195_Terhi Ajosenpää_800px.jpg", // place images to /src/assets/
      internalFunction: "", // can be used to invoke a function in App.vue (see item 'Ohjeet ja karttaselitteet': "showHelpDialog")
      externalLink: "" // can be used to open external link in new tab (see item 'Lue lisää Virmasta': "https://valonia.fi/virmaesite")
    },
    {
      name: "Luontopolut",
      id: 1300,
      columnWidth: 6,
      bgColor: "",
      imageName: "Kasberget_infotaulu_kalliolla_Lasse_Nurmi_800px.jpg",
      internalFunction: "",
      externalLink: ""
    },
    {
      name: "Virkistyskohteet",
      id: 1349,
      columnWidth: 6,
      bgColor: "",
      imageName: "Hierkonpolku_DSC_9174_Terhi Ajosenpää_800px.jpg",
      internalFunction: "",
      externalLink: ""
    },
    {
      name: "Ohjeet ja karttaselitteet",
      id: null,
      columnWidth: 6,
      bgColor: "#58a291",
      imageName: "",
      internalFunction: "showHelpDialog",
      externalLink: ""
    },
    {
      name: "Lue lisää Virmasta",
      id: null,
      columnWidth: 6,
      bgColor: "#58a291",
      imageName: "",
      internalFunction: "",
      externalLink: "https://valonia.fi/virmaesite"
    }
  ]
};

// Content of help-dialog -> 'Karttasymbolit'-tab (Ohje-valikon 'Karttasymbolit'-välilehti )
export let helpDialogSymbols = {
  routes: [
    {
      key: "Kulttuuriulkoilureitti",
      description:
        "Yleisesti kulttuuriympäristöön, kulttuuriperintöön ja kulttuurimaisemaan pohjautuva reitti. Reitti voi kulkea paikoin myös hyvin urbaanissa ympäristössä.",
      imageName: "kulttuuriulkoilureitti_60px.png" // place images to /src/assets/mapsymbols
    },
    {
      key: "Kuntoreitti",
      description:
        "Yleensä valaistu juoksuun tai hölkkäämiseen tarkoitettu reitti puru- tai sorapinnoitteella. ",
      imageName: "kuntoreitti_60px.png"
    },
    {
      key: "Luontopolku",
      description:
        "Suhteellisen lyhyt luonnossa kulkeva polku, jonka varrella on yleensä luontoon ja polun ympäristöön liittyviä opastauluja. Opastussisältö voi olla myös digitaalista mobiililaitteilla luettavaa.",
      imageName: "luontopolku_60px.png"
    },
    {
      key: "Matkailureitti",
      description:
        "Yleensä kymmeniä kilometrejä pitkä reitti, joka on suunniteltu kuljettavan muulla tavoin kuin kävellen esim. autolla tai ryhmämatkailubussilla.",
      imageName: "matkailureitti_60px.png"
    },
    {
      key: "Melontareitti",
      description:
        "Melontaan tarkoitettu reitti, jonka varrella on yleensä kanootin nosto- ja laskupaikkoja sekä mahdollisuus kantaa kanootti kosken tai padon ohi.",
      imageName: "melontareitti_60px.png"
    },
    {
      key: "Pyöräilyreitti",
      description: "Pyöräilyyn tarkoitettu tiepohjia noudattava reitti.",
      imageName: "pyöräilyreitti_60px.png"
    },
    {
      key: "Retkeilyreitti",
      description:
        "Patikointiin tarkoitettu, yleensä vähintään useita kilometrejä pitkä reitti, joka on yleensä maastossa viitoitettu.",
      imageName: "retkeilyreitti_60px.png"
    },
    {
      key: "Retkilatu",
      description:
        "Retkihiihtoon tarkoitettu latupohja. Yleensä perinteisen tyylin latu. Retkiladun ura voi olla merkitty myös vesialueelle, jolloin latu tehdään jäätilanteen niin salliessa.",
      imageName: "retkilatu_60px.png"
    } 
  ],
  pointsRecreation: [
    {
      key: "Ankkuripaikka",
      description: "Suojainen paikka, jonne voi ankkuroitua.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Hätäsatama",
      description: "Hätätilassa käytettävä satamapaikka.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Jätepiste",
      description:
        "Retkeilijöiden käyttöön tarkoitettu jäte- tai kierrätyspiste.",
      imageName: "jätepiste_bw.png"
    },
    {
      key: "Kalastuspaikka",
      description: "Erityisesti kalastukseen tarkoitettu paikka",
      imageName: "kalastuspaikka_bw.png"
    },
    {
      key: "Keittokatos-/ruoanlaittopaikka",
      description:
        "Katettu tulipaikka, jossa on mahdollisuus grillata tai tehdä ruokaa",
      imageName: "keittokatos_bw.png"
    },
    {
      key: "Levähdyspaikka",
      description:
        "Yleensä penkki tai penkkipöytäyhdistelmä, jossa voi levähtää reittiä kulkiessa. Ei tulentekomahdollisuutta.",
      imageName: "levähdyspaikka_bw.png"
    },
    {
      key: "Luonnonmuistomerkki tai näköalapaikka",
      description:
        "Luonnon erityislaatuinen kohde tai luontainen näköalapaikka esim. linnavuori tai muu korkea paikka.",
      imageName: "luonnonmuistomerkki_bw.png"
    },
    {
      key: "Luonto-tai lintutorni",
      description: "Lintujen tai maiseman tarkasteluun tarkoitettu torni",
      imageName: "lintutorni_bw.png"
    },
    {
      key: "Opastuskeskus",
      description:
        "Piste, joka tarjoaa tietoa esim. reitistä tai kohteesta. Usein rakennus tai laajempi infokokonaisuus. Opastuskeskuksessa on yleensä myös henkilökuntaa ainakin osan ajasta.",
      imageName: "opastuskeskus_bw.png"
    },
    {
      key: "Opastuspiste",
      description:
        "Piste, joka tarjoaa tietoa esim. reitistä tai kohteesta. Ei henkilökuntaa.",
      imageName: "opastuspiste_bw.png"
    },
    {
      key: "Polttopuusuoja",
      description:
        "Polttopuuhuollettujen tulipaikkojen ja laavujen polttopuiden säilytykseen tarkoitettu vaja.",
      imageName: "polttopuusuoja_bw.png"
    },
    {
      key: "Päivälaavu tai -kota",
      description: "Päiväkäyttöön tarkoitettu laavu tai kota.",
      imageName: "päivälaavu_bw.png"
    },
    {
      key: "Rantautumispaikka",
      description:
        "Paikka, jossa on mahdollisuus rantautua veneellä tai kanootilla",
      imageName: "rantautumispaikka_bw.png"
    },
    {
      key: "Retkeilyä palveleva parkkipaikka",
      description:
        "Yleensä retkeilyreitin aloituspisteeseen tai virkistyskohteen yhteyteen sijoitettu parkkialue",
      imageName: "retkeilyparkkipaikka_bw.png"
    },
    {
      key: "Retki- tai luonnonsatama",
      description:
        "Yleinen, kaikille avoin satama, jossa ei yleensä ole palveluita.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Sauna",
      description:
        "Yleinen sauna, jonne voi olla pieni saunamaksu. Yleensä tällaisella saunalla on tietyt ajat, jolloin saunaan voi mennä ilman varausta. Sauna voi toimia varaussaunana osan aikaa.",
      imageName: "sauna_bw.png"
    },
    {
      key: "Suojasatama",
      description: "Tuulelta suojainen satamapaikka.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Talviuimapaikka",
      description:
        "Yleinen uimapaikka myös talvikäyttöön. Yleensä talviuimapaikalla on myös sauna.",
      imageName: "talviuimapaikka_bw.png"
    },
    {
      key: "Telttailupaikka",
      description: "Erityisesti telttailuun tarkoitettu alue.",
      imageName: "telttailupaikka_bw.png"
    },
    {
      key: "Tulipaikka",
      description:
        "Yleensä reitin varrella tai virkistyskohteessa oleva paikka, jossa on mahdollisuus tehdä tulet. Tulipaikalla voi olla polttopuuhuolto, mutta voi myös olla että paikalle pitää ottaa omat polttopuut mukaan.",
      imageName: "tulipaikka_bw.png"
    },
    {
      key: "Tupa",
      description: "Yöpymiseen tai päiväkäyttöön tarkoitettu sisätila.",
      imageName: "tupa_bw.png"
    },
    {
      key: "Uimapaikka",
      description: "Yleinen uimapaikka.",
      imageName: "uimapaikka_bw.png"
    },
    {
      key: "Uimaranta",
      description:
        "Yleinen uimapaikka, jossa voi olla ajoittain uimavalvontaa ja muita palveluita.",
      imageName: "uimapaikka_bw.png"
    },
    {
      key: "Veneenlaskupaikka",
      description:
        "Paikka, jossa on mahdollisuus laskea vene tai kanootti trailerilta veteen ramppia pitkin",
      imageName: "veneenlaskupaikka_bw.png"
    },
    {
      key: "Virkistykseen liittyvä erityiskohde",
      description: "Muu erityinen virkistyskohde.",
      imageName: "muu_virkistyskohde_bw.png"
    },
    {
      key: "Virkistysreitin lähtöpiste",
      description:
        "Piste joka on suunniteltu virkistysreitin lähtöpaikaksi.",
      imageName: "virkistysreitin_lähtöpiste_bw.png"
    },
    {
      key: "Yleisö-wc tai -puucee",
      description:
        "Retkeilijöitä tai kävijöitä palveleva yleisesti avoinna oleva wc",
      imageName: "yleisöwc_bw.png"
    },
    {
      key: "Yöpymislaavu tai -kota",
      description: "Yöpymiseen tarkoitettu makuulaavu tai -kota.",
      imageName: "yöpymislaavu_bw.png"
    } 
  ],
  pointsTravel: [
    {
      key: "Kulttuuripalvelu",
      description: "Matkailuun liittyvä kulttuuripalvelu.",
      imageName: "kulttuuripalvelu_bw.png"
    },
    {
      key: "Käyntisatama",
      description:
        "Veneilyä palveleva satama, jossa on yleensä joitain palveluita, mutta vierassatamaa vähemmän. Veneilysesongin aikana satamassa voi olla henkilökuntaa.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Leirikeskus",
      description:
        "Varauksesta käyttöön saatava tai tietylle ryhmälle kuten seurakunnan jäsenille tarkoitettu leirikeskus.",
      imageName: "leirikeskus_bw.png"
    },
    {
      key: "Leirintä- tai caravanalue",
      description:
        "Alue, jossa voi leiriytyä tai yöpyä asuntovaunulla tai autolla. Maksulliset palvelut.",
      imageName: "leirintäalue_bw.png"
    },
    {
      key: "Majoituspalvelu",
      description:
        "Majoituspalvelua retkeilijöille ja matkailijoille tarjoava kohde.",
      imageName: "majoituspalvelu_bw.png"
    },
    {
      key: "Palvelusatama",
      description:
        "Veneilyä palveleva satama, jossa on usein jokin palvelu, kuten kierrätyspiste.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Tilavuokraus- tai kokouspalvelu",
      description:
        "Matkailijoille tai retkeilijöille kokous- tai kokoontumistiloja vuokraava yritys tai yhteisö.",
      imageName: "tilavuokraus_bw.png"
    },
    {
      key: "Varauslaavu tai -kota",
      description:
        "Ennakkovarauksesta käyttöön saatava tai vuokrattava laavu tai kota. ",
      imageName: "päivälaavu_bw.png"
    },
    {
      key: "Vieraslaituri",
      description:
        "Laituri, johon voi jättää veneen esim. kylässä asiointia varten. Yleensä ei muita palveluita.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Vierassatama",
      description:
        "Veneilyä palveleva satama, jossa on erittäin hyvä palveluvarustus ja paikalla on henkilökuntaa veneilysesongin aikana. Yleensä ainakin  osa palveluista on maksullisia.",
      imageName: "satama_tai_ankkuripaikka_bw.png"
    },
    {
      key: "Yhteysaluslaituri",
      description: "Laituri, johon liikennöi yhteysalus.",
      imageName: "yhteysaluslaituri_bw.png"
    } 
  ]
};

// Content of backgroundmaps extension panel (Taustakartat)
export let backGroundMaps = {
  visible: true,
  // openOnStartUp-setting is an array of expansion-panels that are open by default.
  // In case of background maps, there are no other panels, but logic (in Vuetify) is still the same.
  // In other words: zero does not mean 'false' or 'closed', but first (and only) panel.
  // Set to empty array if background-maps extension panel should be closed.
  openOnStartUp: [0],
  selected: 327, // also acts as "selected on startup"
  layers: [
    {
      name: "Taustakartta", // name shown in the expansion panel
      id: 327 // layer id:s are logged to console when layersMenuContent:logLayerInfoToConsole = true
    },
    {
      name: "Maastokartta",
      id: 1175
    },
    {
      name: "Ilmakuva",
      id: 1165
    }
  ]
};

// Content of the layers menu except backgroundmaps (Tasot-valikon sisältö poislukien taustakartat) 
export let layersMenuContent = {
  logLayerInfoToConsole: false, // Karttapalvelu map layer id:s are logged to console when logLayerInfoToConsole = true
  layersLoaded: false, // Not actually config, but belongs to object, don't change by hand
  parentPointersSet: false, // Not actually config, but belongs to object, don't change by hand
  openOnStartUp: [], // Use the same way as in backGroundMaps
  layers: [
    // See usage below from the ones in use / in comments

    // accordion either has or doesn't have subcontent.
    // Subcontent can be:
    // - WMS Layer
    // - self created layer with one or more WFS features (not in use yet)
    // - virtual layer = accordion with no associated layer, but has subContent
    // - text / link content

    // .type has to have value always, it's either virtual or 'real' layer. Possible values: virtual, wms, wfs (not yet implemented!), text
    // .renderAs possible values: accordion, checkbox, text
    // .visible overrides visibility set in karttajulkaisu / Karttapalvelu

    
    // IMPORTANT! Wfs-layer functionality is not programmed yet. Here are some thoughts about it.
    // Functionality should rely on every top level wfs layer to actually have/be layer that can be turned on/off as a whole
    // even if it has (one or many) subItems/subLayers (what was just said is true for subLayers also). Otherwise it should be type: "virtual".
    // example: Kuntoradat -> Turku -> rata1, rata2 etc. Here Kuntoradat is supposedly wms-layer, but Turku is wfs-layer which is fetched
    // on user interaction. Then it has to be parsed as oskari-wfs-layer which includes wfs-features rata1, rata2 etc.
    // This way Turku-layer visibility can be turned on/off with single layer-id (instead of going through every subItem)

    // Points (Kohteet)
    {
      nameXs: "Varsinais-Suomen", // May be empty if there is none
      name: "Virkistyskohteet",
      id: 1349, // layer id:s are logged to console when logLayerInfoToConsole = true. null when type is 'virtual'
      type: "wms",
      visible: false, // visibility on startup (and also used for 'eye')
      checked: null, // null unless renderAs == "checkbox" (used for checkbox state (also for 'select all') / not really config -> basically shouldn't be here)
      renderAs: "accordion",
      style: {
        backgroundColor: "#bcdad3", // color of expansion panel
        class: "" // possible css-class(es) (propably usually classes in Vuetify, used for vertical spacing between expansion panels)
      },
      subContent: []
    },

    {
      nameXs: "Varsinais-Suomen",
      name: "Luontomatkailupalvelut",
      id: 1355,
      type: "wms",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#bcdad3",
        class: ""
      },
      subContent: []
    },

    // Routes (Reitit)
    {
      nameXs: "Varsinais-Suomen",
      name: "Virkistysreitit",
      id: null,
      type: "virtual",
      visible: true,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#bcdad3",
        class: "mb-4"
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
            imageName: "luontopolku_60px.png" // place images to /src/assets/mapsymbols
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
            imageName: "matkailureitti_60px.png"
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
            imageName: "melontareitti_60px.png"
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
            imageName: "pyöräilyreitti_60px.png"
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
            imageName: "retkeilyreitti_60px.png"
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
            imageName: "retkilatu_60px.png"
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
            imageName: "kuntoreitti_60px.png"
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
            imageName: "kulttuuriulkoilureitti_60px.png"
          }
        }
      ]
    },

    // Reitistökokonaisuudet
    {
      nameXs: "",
      name: "Reitistökokonaisuudet",
      id: null,
      type: "virtual",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#cccccc",
        class: "mb-4"
      },
      subContent: [
        {
          name: "Kuhankuonon retkeilyreitistö",
          id: 226,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox",
          legend: {
            imageName: ""
          }
        }
        // {
        //   name: "Harjureitti",
        //   id: 1202, // TODO get right layer from Karttapalvelu
        //   type: "wms",
        //   visible: false,
        //   checked: false,
        //   renderAs: "checkbox",
        //   legend: {
        //     imageName: ""
        //   }
        // }
      ]
    },

    // Muut tasot
    {
      nameXs: "",
      name: "Muut karttatasot",
      id: null,
      type: "virtual",
      visible: false,
      checked: null,
      renderAs: "accordion",
      style: {
        backgroundColor: "#e6e6e6",
        class: "mb-4"
      },
      subContent: [
        {
          name: "Turun seudun pyörätiet",
          id: 1202,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox",
          legend: {
            imageName: ""
          }
        },
        {
          name: "Turun bussipysäkit",
          id: 1184,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox",
          legend: {
            imageName: ""
          }
        },
        {
          name: "Turun bussireitit",
          id: 1183,
          type: "wms",
          visible: false,
          checked: false,
          renderAs: "checkbox",
          legend: {
            imageName: ""
          }
        }
      ]
    }
   
    // {
    //   name: "WMS + text accordion example",
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
    //       renderAs: "checkbox",
    //       legend: {
    //         imageName: ""
    //       }
    //     },
    //     {
    //       name: "<a>Text content in link tag</a>",
    //       id: null,
    //       type: "text",
    //       visible: true,
    //       renderAs: "text",
    //       legend: {
    //         imageName: ""
    //       }
    //     }
    //   ]
    // }

  ]
};
