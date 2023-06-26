import Vue from "vue";
import VueRouter from 'vue-router';
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueMatomo from 'vue-matomo';

// TODO remove vue-plugin-load-script from dependencies
// import LoadScript from "vue-plugin-load-script";
// Vue.use(LoadScript);

Vue.config.productionTip = false;
Vue.use(VueRouter);

// TODO remove when finished playing with
// eslint-disable-next-line
var store = {
  state: {
    message: "store.state täällä!"
  }
};

// TODO: This is probably the better way
/*
import { createRouter, createWebHistory } from 'vue-router'

const router2 = createRouter({
  history: createWebHistory(),
  routes: []
});
*/
const router = new VueRouter({
  mode: "history"
});

// Usage tracking only: no cookies, no IPs, no sessions, data resides only inside Finland
Vue.use(VueMatomo, {
  // Configure your matomo server and site by providing
  host: 'https://analytics.utu.fi',
  siteId: 74,
  router: router,
  enableLinkTracking: false,
  disableCookies: true,
  enableHeartBeatTimer: true,

  heartBeatTimerInterval: 15,

  debug: false,

  userId: undefined,

  domains: "*.virma.fi",

  // A list of pre-initialization actions that run before matomo is loaded
  // Default: []
  // Example: [
  //   ['API_method_name', parameter_list],
  //   ['setCustomVariable','1','VisitorType','Member'],
  //   ['appendToTrackingUrl', 'new_visit=1'],
  //   etc.
  // ]
  preInitActions: [],

  // A function to determine whether to track an interaction as a site search
  // instead of as a page view. If not a function, all interactions will be
  // tracked as page views. Receives the new route as an argument, and
  // returns either an object of keyword, category (optional) and resultsCount
  // (optional) to track as a site search, or a falsey value to track as a page
  // view.
  // Default: false, i.e. track all interactions as page views
  // Example: (to) => {
  //   if (to.query.q && to.name === 'search') {
  //     return { keyword: to.query.q, category: to.params.category }
  //   } else {
  //    return null
  //   }
  // }
  trackSiteSearch: false
});


new Vue({
  router,
  vuetify,
  data: { sharedState: store.state },
  render: h => h(App)
}).$mount("#app");
