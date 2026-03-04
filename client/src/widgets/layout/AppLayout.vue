<template>
  <div>
    <v-navigation-drawer v-model="drawer" app clipped class="app-drawer">
      <v-list dense nav class="pt-4">
        <v-list-item to="/dashboard" link class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/clients" link class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Clients</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/tasks" link class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-format-list-checks</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Tasks</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="isAdmin" to="/users" link class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-account-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Users</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-3" style="border-color: rgba(47, 107, 104, 0.4)" />
        <v-list-item to="/profile" link class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout" class="drawer-item">
          <v-list-item-icon class="drawer-icon-wrap">
            <v-icon color="primary">mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="drawer-title">Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app clipped-left flat class="app-bar-teal">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="app-bar-title">CRM</v-toolbar-title>
      <v-spacer />
      <span class="app-bar-user">{{ currentUserName }}</span>
    </v-app-bar>
    <v-main>
      <v-container fluid class="app-page-container">
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.app-drawer {
  background: rgba(18, 30, 41, 0.95) !important;
  border-right: 1px solid rgba(64, 224, 208, 0.2) !important;
}
.drawer-icon-wrap {
  background: #1f4947 !important;
  border-radius: 14px;
  margin-right: 12px;
  min-width: 38px !important;
  width: 38px;
  height: 38px;
  justify-content: center;
}
.drawer-title {
  color: #b2f0e6 !important;
  font-weight: 500;
}
.drawer-item.v-list-item--active {
  background: rgba(45, 212, 191, 0.15) !important;
  border-left: 3px solid #2dd4bf;
}
.drawer-item:hover {
  background: rgba(45, 212, 191, 0.08) !important;
}
.app-bar-teal {
  background: linear-gradient(90deg, rgba(18, 30, 41, 0.98) 0%, rgba(26, 47, 63, 0.98) 100%) !important;
  border-bottom: 1px solid rgba(64, 224, 208, 0.25) !important;
}
.app-bar-title {
  color: #b2f0e6 !important;
  font-weight: 600;
  font-size: 1.35rem !important;
}
.app-bar-user {
  color: #8dd4cc;
  font-size: 0.95rem;
  padding: 6px 16px;
  background: rgba(15, 46, 82, 0.6);
  border-radius: 24px;
  border: 1px solid rgba(69, 204, 201, 0.3);
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex';
import { authApi } from '../../entities/user/api';

export default {
  name: 'AppLayout',
  data: () => ({ drawer: true }),
  computed: {
    ...mapGetters('user', ['currentUser', 'isAdmin']),
    currentUserName() {
      return this.currentUser?.name || 'User';
    },
  },
  methods: {
    ...mapActions('user', { logoutStore: 'logout', setUser: 'setUser' }),
    async logout() {
      try {
        await authApi.logout();
      } catch (_) { /* ignore */ }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.logoutStore();
      // Full page navigation to avoid guard redirect error; new load sees no token
      window.location.replace('/login');
    },
  },
};
</script>
