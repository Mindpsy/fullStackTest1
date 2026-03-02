const state = {
  user: null,
};

const getters = {
  isAuthenticated: (s) => !!s.user,
  currentUser: (s) => s.user,
  isAdmin: (s) => s.user && s.user.role === 'admin',
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  LOGOUT(state) {
    state.user = null;
  },
};

const actions = {
  setUser({ commit }, user) {
    commit('SET_USER', user);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  },
  logout({ commit }) {
    commit('LOGOUT');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
