<template>
  <div>
    <h1 class="text-h4 mb-4">Clients</h1>
    <widget-client-table
      :items="clients"
      :total="total"
      :loading="loading"
      :filters.sync="filters"
      :page.sync="page"
      :limit.sync="limit"
      :is-admin="isAdmin"
      @fetch="fetchClients"
      @add="openCreate"
      @view="openView"
      @edit="openEdit"
      @delete="openDelete"
      @export="exportCsv"
    />
    <feature-client-form-dialog
      v-model="dialogCreate"
      mode="create"
      @saved="onSaved"
    />
    <feature-client-form-dialog
      v-model="dialogEdit"
      mode="edit"
      :client-id="selectedId"
      @saved="onSaved"
    />
    <feature-client-view-dialog v-model="dialogView" :client-id="selectedId" />
    <feature-delete-client-dialog
      v-model="dialogDelete"
      :client-id="selectedId"
      @deleted="onDeleted"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import WidgetClientTable from '../../widgets/client-table/WidgetClientTable.vue';
import FeatureClientFormDialog from '../../features/client-form/FeatureClientFormDialog.vue';
import FeatureClientViewDialog from '../../features/client-view/FeatureClientViewDialog.vue';
import FeatureDeleteClientDialog from '../../features/delete-client/FeatureDeleteClientDialog.vue';

export default {
  name: 'ClientsPage',
  components: {
    WidgetClientTable,
    FeatureClientFormDialog,
    FeatureClientViewDialog,
    FeatureDeleteClientDialog,
  },
  data: () => ({
    loading: false,
    dialogCreate: false,
    dialogEdit: false,
    dialogView: false,
    dialogDelete: false,
    selectedId: null,
    filters: { search: '', status: '', managerId: '' },
    page: 1,
    limit: 10,
  }),
  computed: {
    ...mapState('client', ['list', 'total']),
    ...mapGetters('user', ['isAdmin']),
    clients: function() {
      return this.list;
    },
  },
  watch: {
    '$route.query': {
      handler(q) {
        if (q.status) this.filters.status = q.status;
        if (q.search) this.filters.search = q.search;
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchClients();
  },
  methods: {
    async fetchClients() {
      this.loading = true;
      try {
        await this.$store.dispatch('client/setFilters', this.filters);
        this.$store.commit('client/SET_PAGE', this.page);
        this.$store.commit('client/SET_LIMIT', this.limit);
        await this.$store.dispatch('client/fetchClients');
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.dialogCreate = true;
    },
    openView(id) {
      this.selectedId = id;
      this.dialogView = true;
    },
    openEdit(id) {
      this.selectedId = id;
      this.dialogEdit = true;
    },
    openDelete(id) {
      this.selectedId = id;
      this.dialogDelete = true;
    },
    onSaved() {
      this.fetchClients();
    },
    onDeleted() {
      this.fetchClients();
    },
    async exportCsv() {
      try {
        const { clientsApi } = await import('../../entities/client/api');
        const res = await clientsApi.exportCsv(this.filters);
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.$store.dispatch('notifications/show', { text: 'Export started', color: 'success' });
      } catch (e) {
        this.$store.dispatch('notifications/show', { text: e.response?.data?.message || 'Export failed', color: 'error' });
      }
    },
  },
};
</script>
