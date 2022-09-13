
import Vue from 'vue/dist/vue.esm.js'
import App from "./app.vue";
import KintoneVueComponent from 'kintone-vue-component';
import 'kintone-vue-component/dist/kintone-vue-component.css';
import Donut from 'vue-css-donut-chart';
import 'vue-css-donut-chart/dist/vcdonut.css';
import fullCalendar from 'vue-fullcalendar'


Vue.config.productionTip = false;
Vue.use(KintoneVueComponent);
Vue.use(Donut);
Vue.component('full-calendar', fullCalendar)

kintone.events.on('app.record.index.show', function (event) {
  Vue.set(KintoneVueComponent);
  if (event.viewName === 'アクセス分析') {
    const vm = new Vue(App).$mount('#app');
    vm.$data.event = event
  }
});