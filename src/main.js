import Vue from "vue";
import VueRouter from 'vue-router';
import App from "./App.vue";
import vuetify from "./plugins/vuetify";

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

const router = new VueRouter({
  mode: "history"
});

new Vue({
  router,
  vuetify,
  data: { sharedState: store.state },
  render: h => h(App)
}).$mount("#app");
