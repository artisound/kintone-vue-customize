
import Vue from "vue";
import App from "./app.vue";
import VueGoogleApi from 'vue-google-api';
import fullCalendar from 'vue-fullcalendar';
import KintoneVueComponent from 'kintone-vue-component';
import 'kintone-vue-component/dist/kintone-vue-component.css';
// const ga_config = {
//   scope   : 'https://www.googleapis.com/auth/analytics',
//   apiKey  : process.env.GCP_API_KEY,
//   clientId: process.env.GCP_CLIENT_ID,
//   discoveryDocs: ['https://analyticsreporting.googleapis.com/$discovery/rest?version=v4'],
// };

Vue.config.productionTip = false;
Vue.component('full-calendar', fullCalendar)
Vue.use(KintoneVueComponent);
// Vue.use(VueGoogleApi, ga_config);

kintone.events.on('app.record.index.show', function (event) {
  Vue.set(KintoneVueComponent);
  if (event.viewName === '一覧1') {
    const vm = new Vue(App).$mount('#app');
    vm.$data.event = event
  }
});