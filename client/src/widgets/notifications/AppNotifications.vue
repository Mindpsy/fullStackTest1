<template>
  <v-snackbar
    v-model="visible"
    :color="current.color"
    :timeout="4000"
    top
    right
    @input="onClose"
  >
    {{ current.text }}
    <template #action="{ attrs }">
      <v-btn text v-bind="attrs" @click="visible = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AppNotifications',
  data: () => ({ visible: false }),
  computed: {
    ...mapState('user', ['user']),
    current() {
      return this.$store.state.notifications?.current || { text: '', color: 'info' };
    },
  },
  watch: {
    'current.text'(val) {
      if (val) this.visible = true;
    },
  },
  methods: {
    onClose() {
      this.$store.commit('notifications/SHOW', { text: '', color: 'info' });
    },
  },
};
</script>
