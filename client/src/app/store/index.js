import Vue from 'vue';
import Vuex from 'vuex';
import user from '../../entities/user/store';

Vue.use(Vuex);

const notifications = {
  namespaced: true,
  state: { current: { text: '', color: 'info' } },
  mutations: {
    SHOW(state, { text, color = 'info' }) {
      state.current = { text, color };
    },
  },
  actions: {
    show({ commit }, payload) {
      commit('SHOW', typeof payload === 'string' ? { text: payload } : payload);
    },
  },
};

const store = new Vuex.Store({
  modules: {
    user,
    notifications,
  },
});

export default store;
