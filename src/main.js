import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

// TODO remove vue-plugin-load-script from dependencies
// import LoadScript from "vue-plugin-load-script";
// Vue.use(LoadScript);

Vue.config.productionTip = false;

// TODO remove when finished playing with
// eslint-disable-next-line
var store = {
  state: {
    message: "store.state täällä!"
  }
};

new Vue({
  vuetify,
  data: { sharedState: store.state },
  render: h => h(App)
}).$mount("#app");

// TODO debug, remove
console.log("main.js valmis");
