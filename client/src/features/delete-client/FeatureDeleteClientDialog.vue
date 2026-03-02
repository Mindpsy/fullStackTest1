<template>
  <v-dialog v-model="visible" max-width="400" persistent>
    <v-card>
      <v-card-title>Delete client?</v-card-title>
      <v-card-text>This action cannot be undone.</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="visible = false">Cancel</v-btn>
        <v-btn color="error" :loading="loading" @click="confirm">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { clientsApi } from '../../entities/client/api';

export default {
  name: 'FeatureDeleteClientDialog',
  props: {
    value: { type: Boolean, default: false },
    clientId: { type: String, default: null },
  },
  data: () => ({ loading: false }),
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      },
    },
  },
  methods: {
    async confirm() {
      if (!this.clientId) return;
      this.loading = true;
      try {
        await clientsApi.remove(this.clientId);
        this.$store.dispatch('notifications/show', { text: 'Deleted', color: 'success' });
        this.visible = false;
        this.$emit('deleted');
      } catch (e) {
        this.$store.dispatch('notifications/show', {
          text: e.response?.data?.message || 'Error',
          color: 'error',
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
