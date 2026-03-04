<template>
  <v-card class="app-glass-card">
    <v-card-title class="d-flex align-center app-card-title py-3">
      {{ title }}
      <v-spacer />
      <v-btn text small color="primary" :to="linkTo">All</v-btn>
    </v-card-title>
    <v-list v-if="items.length" dense class="recent-list-teal">
      <v-list-item v-for="item in items" :key="item._id" class="recent-item">
        <v-list-item-content>
          <v-list-item-title class="recent-title">{{ itemTitle(item) }}</v-list-item-title>
          <v-list-item-subtitle class="recent-subtitle">{{ itemSubtitle(item) }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else class="app-muted">No items</v-card-text>
  </v-card>
</template>

<script>
import { formatDateShort } from '../../shared/lib/format';

export default {
  name: 'WidgetRecentList',
  props: {
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
    type: { type: String, required: true },
    linkTo: { type: String, default: '#' },
  },
  methods: {
    itemTitle(item) {
      if (this.type === 'client') return item.name;
      return item.title;
    },
    itemSubtitle(item) {
      if (this.type === 'client') {
        const parts = [item.status, item.company].filter(Boolean);
        const manager = item.managerId?.name;
        if (manager) parts.push(manager);
        parts.push(formatDateShort(item.createdAt));
        return parts.join(' • ');
      }
      const parts = [item.status, item.priority].filter(Boolean);
      const client = item.clientId?.name;
      if (client) parts.push(client);
      if (item.dueDate) parts.push(formatDateShort(item.dueDate));
      return parts.join(' • ');
    },
  },
};
</script>

<style scoped>
.recent-list-teal { background: transparent !important; }
.recent-item { border-bottom: 1px solid rgba(64, 224, 208, 0.12); }
.recent-title { color: #b2f0e6 !important; }
.recent-subtitle { color: #7eb8b0 !important; }
</style>
