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
        style="max-width: 120px"
        @change="$emit('fetch')"
      />
      <v-spacer />
      <v-btn class="mb-2 mr-2" color="primary" @click="$emit('export')">Export</v-btn>
      <v-btn class="mb-2" color="primary" @click="$emit('add')">+ Add client</v-btn>
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
      <template #item.managerId="{ item }">
        {{ item.managerId?.name || '-' }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon small @click="$emit('view', item._id)">
          <v-icon small>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon small @click="$emit('edit', item._id)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="isAdmin" icon small @click="$emit('delete', item._id)">
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: 'WidgetClientTable',
  props: {
    items: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    filters: { type: Object, required: true },
    page: { type: Number, required: true },
    limit: { type: Number, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  data() {
    return {
      options: {
        page: this.page,
        itemsPerPage: this.limit,
        sortBy: [],
        sortDesc: [],
      },
      statusItems: [
      { value: '', text: 'All' },
      { value: 'active', text: 'Active' },
      { value: 'inactive', text: 'Inactive' },
      { value: 'lead', text: 'Lead' },
    ],
    headers: [
      { text: 'Name', value: 'name', sortable: false },
      { text: 'Status', value: 'status', sortable: false },
      { text: 'Manager', value: 'managerId', sortable: false },
      { text: 'Company', value: 'company', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false, width: 120 },
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
      const map = { active: 'green', inactive: 'grey', lead: 'orange' };
      return map[s] || 'grey';
    },
  },
};
</script>
