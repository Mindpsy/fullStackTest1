import Vue from 'vue';
import App from './app/App.vue';
import router from './app/router';
import store from './app/store';
import vuetify from './app/plugins/vuetify';

Vue.config.productionTip = false;

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
if (token && userStr) {
  try {
    store.commit('user/SET_USER', JSON.parse(userStr));
  } catch (_) { /* restore failed */ }
}

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
