<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      {{ title }}
      <v-spacer />
      <v-btn text small :to="linkTo">All</v-btn>
    </v-card-title>
    <v-list v-if="items.length" dense>
      <v-list-item v-for="item in items" :key="item._id">
        <v-list-item-content>
          <v-list-item-title>{{ itemTitle(item) }}</v-list-item-title>
          <v-list-item-subtitle>{{ itemSubtitle(item) }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else>No items</v-card-text>
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
