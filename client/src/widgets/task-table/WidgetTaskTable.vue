<template>
  <v-card>
    <v-card-title class="d-flex flex-wrap align-center">
      <v-text-field
        v-model="localFilters.search"
        placeholder="Search..."
        hide-details
        dense
        outlined
        class="mr-2 mb-2"
        style="max-width: 200px"
        @input="$emit('fetch')"
      />
      <v-select
        v-model="localFilters.status"
        :items="statusItems"
        label="Status"
        hide-details
        dense
        outlined
        clearable
        class="mr-2 mb-2"
        style="max-width: 140px"
        @change="$emit('fetch')"
      />
      <v-select
        v-model="localFilters.priority"
        :items="priorityItems"
        label="Priority"
        hide-details
        dense
        outlined
        clearable
        class="mr-2 mb-2"
        style="max-width: 120px"
        @change="$emit('fetch')"
      />
      <v-spacer />
      <v-btn class="mb-2 mr-2" color="primary" @click="$emit('export')">Export</v-btn>
      <v-btn class="mb-2" color="primary" :disabled="!clients.length" @click="$emit('add')">+ Add task</v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :server-items-length="total"
      :options.sync="options"
      item-key="_id"
      class="elevation-0"
    >
      <template #item.status="{ item }">
        <v-chip small :color="statusColor(item.status)">{{ item.status }}</v-chip>
      </template>
      <template #item.priority="{ item }">
        <v-chip small :color="priorityColor(item.priority)">{{ item.priority }}</v-chip>
      </template>
      <template #item.clientId="{ item }">
        {{ item.clientId?.name || '-' }}
      </template>
      <template #item.dueDate="{ item }">
        {{ formatDateShort(item.dueDate) }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { formatDateShort } from '../../shared/lib/format';
import { TASK_STATUSES, PRIORITIES } from '../../shared/config/constants';

export default {
  name: 'WidgetTaskTable',
  props: {
    items: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    filters: { type: Object, required: true },
    page: { type: Number, required: true },
    limit: { type: Number, required: true },
    isAdmin: { type: Boolean, default: false },
    clients: { type: Array, default: () => [] },
  },
  data() {
    return {
      options: {
        page: this.page,
        itemsPerPage: this.limit,
        sortBy: [],
        sortDesc: [],
      },
      statusItems: [{ value: '', text: 'All' }, ...TASK_STATUSES.map((s) => ({ value: s.value, text: s.text }))],
      priorityItems: [{ value: '', text: 'All' }, ...PRIORITIES.map((p) => ({ value: p.value, text: p.text }))],
      headers: [
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Priority', value: 'priority', sortable: false },
        { text: 'Client', value: 'clientId', sortable: false },
        { text: 'Due date', value: 'dueDate', sortable: false },
      ],
    };
  },
  watch: {
    options: {
      handler(opts) {
        let needFetch = false;
        if (opts.page !== this.page) {
          this.$emit('update:page', opts.page);
          needFetch = true;
        }
        if (opts.itemsPerPage !== this.limit) {
          this.$emit('update:limit', opts.itemsPerPage);
          needFetch = true;
        }
        if (needFetch) this.$emit('fetch');
      },
      deep: true,
    },
    page: { handler(v) { this.options.page = v; }, immediate: true },
    limit: { handler(v) { this.options.itemsPerPage = v; }, immediate: true },
  },
  computed: {
    localFilters: {
      get() {
        return this.filters;
      },
      set(v) {
        this.$emit('update:filters', v);
      },
    },
  },
  methods: {
    statusColor(s) {
      const map = { pending: 'orange', in_progress: 'blue', completed: 'green' };
      return map[s] || 'grey';
    },
    priorityColor(p) {
      const map = { low: 'grey', medium: 'blue', high: 'red' };
      return map[p] || 'grey';
    },
  },
};
</script>
