import { usersApi } from '../user/api';

const state = {
  list: [],
  total: 0,
  page: 1,
  limit: 20,
};

const getters = {
  users: (s) => s.list,
  usersTotal: (s) => s.total,
};

const mutations = {
  SET_LIST(state, { data, total, page, limit }) {
    state.list = data || [];
    state.total = total || 0;
    state.page = page || 1;
    state.limit = limit || 20;
  },
};

const actions = {
  async fetchUsers({ commit, state }) {
    const res = await usersApi.list({
      page: state.page,
      limit: state.limit,
    });
    commit('SET_LIST', {
      data: res.data.data,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
    });
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
