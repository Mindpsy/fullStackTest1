import { tasksApi } from './api';

const state = {
  list: [],
  total: 0,
  page: 1,
  limit: 10,
  filters: {},
  current: null,
};

const getters = {
  tasks: (s) => s.list,
  tasksTotal: (s) => s.total,
  tasksByStatus: (s) => (status) => s.list.filter((t) => t.status === status),
  tasksPagination: (s) => ({ page: s.page, limit: s.limit, total: s.total }),
};

const mutations = {
  SET_LIST(state, { data, total, page, limit }) {
    state.list = data || [];
    state.total = total || 0;
    state.page = page || 1;
    state.limit = limit || 10;
  },
  SET_CURRENT(state, task) {
    state.current = task;
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
  UPDATE_TASK_IN_LIST(state, task) {
    const i = state.list.findIndex((t) => t._id === task._id);
    if (i >= 0) state.list.splice(i, 1, task);
  },
  REMOVE_TASK_FROM_LIST(state, id) {
    state.list = state.list.filter((t) => t._id !== id);
    state.total = Math.max(0, state.total - 1);
  },
  ADD_TASK_TO_LIST(state, task) {
    state.list.unshift(task);
    state.total += 1;
  },
};

const actions = {
  async fetchTasks({ commit, state }) {
    const params = {
      page: state.page,
      limit: state.limit,
      ...state.filters,
    };
    const res = await tasksApi.list(params);
    commit('SET_LIST', res.data);
    return res.data;
  },
  setFilters({ commit, state }, filters) {
    commit('SET_FILTERS', filters);
    commit('SET_LIST', { data: [], total: 0, page: 1, limit: state.limit });
  },
  async fetchById({ commit }, id) {
    const res = await tasksApi.getById(id);
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
