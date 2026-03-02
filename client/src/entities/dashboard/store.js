import api from '../../shared/api/axios';

const state = {
  stats: null,
  recentClients: [],
  recentTasks: [],
};

const getters = {
  stats: (s) => s.stats,
  recentClients: (s) => s.recentClients,
  recentTasks: (s) => s.recentTasks,
};

const mutations = {
  SET_STATS(state, stats) {
    state.stats = stats;
  },
  SET_RECENT(state, { recentClients, recentTasks }) {
    state.recentClients = recentClients || [];
    state.recentTasks = recentTasks || [];
  },
};

const actions = {
  async fetchStats({ commit }) {
    const res = await api.get('/dashboard/stats');
    commit('SET_STATS', res.data);
    return res.data;
  },
  async fetchRecent({ commit }) {
    const res = await api.get('/dashboard/recent-activities');
    commit('SET_RECENT', res.data);
    return res.data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
