<template>
  <v-app>
    <app-notifications />
    <router-view />
  </v-app>
</template>

<script>
import AppNotifications from '../widgets/notifications/AppNotifications.vue';
import { connectSocket, getSocket, disconnectSocket } from '../shared/api/socket';

export default {
  name: 'App',
  components: { AppNotifications },
  computed: {
    token() {
      return localStorage.getItem('token');
    },
  },
  watch: {
    token(val) {
      if (!val) disconnectSocket();
      else this.initSocket();
    },
  },
  mounted() {
    if (this.token) this.initSocket();
  },
  methods: {
    initSocket() {
      const s = connectSocket(this.token);
      if (!s || s._notifySetup) return;
      s._notifySetup = true;
      ['task:created', 'task:updated', 'task:deleted', 'client:created', 'client:updated', 'client:deleted'].forEach((ev) => {
        s.on(ev, () => {
          this.$store.dispatch('notifications/show', { text: `Event: ${ev}`, color: 'info' });
        });
      });
      s.on('reminder', (payload) => {
        this.$store.dispatch('notifications/show', {
          text: `Reminder: ${payload?.taskTitle || 'Task'} due soon`,
          color: 'warning',
        });
      });
    },
  },
};
</script>
