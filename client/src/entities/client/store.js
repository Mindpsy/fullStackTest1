import { clientsApi } from './api';

const state = {
  list: [],
  total: 0,
  page: 1,
  limit: 10,
  filters: {},
  current: null,
};

const getters = {
  clients: (s) => s.list,
  clientsTotal: (s) => s.total,
  clientsPagination: (s) => ({ page: s.page, limit: s.limit, total: s.total }),
};

const mutations = {
  SET_LIST(state, { data, total, page, limit }) {
    state.list = data;
    state.total = total;
    state.page = page;
    state.limit = limit;
  },
  SET_CURRENT(state, client) {
    state.current = client;
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_PAGE(state, page) {
    state.page = page;
  },
  SET_LIMIT(state, limit) {
    state.limit = limit;
  },
};

const actions = {
  async fetchClients({ commit, state }) {
    const raw = { page: state.page, limit: state.limit, ...state.filters };
    const params = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== '' && v != null)
    );
    const res = await clientsApi.list(params);
    commit('SET_LIST', res.data);
    return res.data;
  },
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
    commit('SET_LIST', { data: [], total: 0, page: 1, limit: state.limit });
  },
  setPage({ commit }, page) {
    commit('SET_PAGE', page);
  },
  async fetchById({ commit }, id) {
    const res = await clientsApi.getById(id);
    commit('SET_CURRENT', res.data);
    return res.data;
  },
  clearCurrent({ commit }) {
    commit('SET_CURRENT', null);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
