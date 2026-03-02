<template>
  <v-dialog v-model="visible" max-width="500" persistent>
    <v-card v-if="client">
      <v-card-title>{{ client.name }}</v-card-title>
      <v-card-text>
        <p><strong>Email:</strong> {{ client.email || '-' }}</p>
        <p><strong>Phone:</strong> {{ client.phone || '-' }}</p>
        <p><strong>Company:</strong> {{ client.company || '-' }}</p>
        <p><strong>Status:</strong> <v-chip small>{{ client.status }}</v-chip></p>
        <p><strong>Manager:</strong> {{ client.managerId?.name || '-' }}</p>
        <p v-if="client.notes"><strong>Notes:</strong><br>{{ client.notes }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="visible = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { clientsApi } from '../../entities/client/api';

export default {
  name: 'FeatureClientViewDialog',
  props: {
    value: { type: Boolean, default: false },
    clientId: { type: String, default: null },
  },
  data: () => ({ client: null }),
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
  watch: {
    value(val) {
      if (val && this.clientId) this.load();
    },
  },
  methods: {
    async load() {
      const res = await clientsApi.getById(this.clientId);
      this.client = res.data;
    },
  },
};
</script>
