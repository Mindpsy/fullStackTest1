<template>
  <div>
    <h1 class="text-h4 mb-4 app-heading-gradient">Tasks</h1>
    <v-tabs v-model="tab" class="app-tabs-teal">
      <v-tab>Table</v-tab>
      <v-tab>Kanban</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <widget-task-table
          :items="tasks"
          :total="total"
          :loading="loading"
          :filters.sync="filters"
          :page.sync="page"
          :limit.sync="limit"
          :is-admin="isAdmin"
          :clients="clientsForSelect"
          @fetch="fetchTasks"
          @add="openCreate"
          @export="exportCsv"
        />
      </v-tab-item>
      <v-tab-item>
        <widget-task-board
          :tasks="allTasksForKanban"
          :loading="loadingKanban"
          @status-change="onStatusChange"
        />
      </v-tab-item>
    </v-tabs-items>
    <feature-task-form-dialog
      v-model="dialogCreate"
      :clients="clientsForSelect"
      @saved="onSaved"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import WidgetTaskTable from '../../widgets/task-table/WidgetTaskTable.vue';
import WidgetTaskBoard from '../../widgets/task-board/WidgetTaskBoard.vue';
import FeatureTaskFormDialog from '../../features/task-form/FeatureTaskFormDialog.vue';
import { clientsApi } from '../../entities/client/api';
import { tasksApi } from '../../entities/task/api';

export default {
  name: 'TasksPage',
  components: {
    WidgetTaskTable,
    WidgetTaskBoard,
    FeatureTaskFormDialog,
  },
  data: () => ({
    tab: 0,
    loading: false,
    loadingKanban: false,
    dialogCreate: false,
    filters: { search: '', status: '', priority: '', clientId: '' },
    page: 1,
    limit: 10,
    clientsForSelect: [],
    kanbanTasks: [],
  }),
  computed: {
    ...mapState('task', ['list', 'total']),
    ...mapGetters('user', ['isAdmin']),
    tasks() {
      return this.list;
    },
    allTasksForKanban() {
      return this.tab === 1 ? this.kanbanTasks : [];
    },
  },
  watch: {
    '$route.query': {
      handler(q) {
        if (q.status) this.filters.status = q.status;
      },
      immediate: true,
    },
    tab(val) {
      if (val === 1 && this.kanbanTasks.length === 0) this.fetchKanbanTasks();
    },
  },
  mounted() {
    this.fetchTasks();
    this.loadClients();
  },
  methods: {
    async loadClients() {
      const res = await clientsApi.list({ limit: 100 });
      this.clientsForSelect = (res.data.data || []).map((c) => ({
        value: c._id,
        text: c.name,
      }));
    },
    async fetchTasks() {
      this.loading = true;
      try {
        await this.$store.dispatch('task/setFilters', this.filters);
        this.$store.commit('task/SET_PAGE', this.page);
        this.$store.commit('task/SET_LIMIT', this.limit);
        await this.$store.dispatch('task/fetchTasks');
      } finally {
        this.loading = false;
      }
    },
    async fetchKanbanTasks() {
      this.loadingKanban = true;
      try {
        const res = await tasksApi.list({ limit: 200 });
        this.kanbanTasks = res.data.data || [];
      } finally {
        this.loadingKanban = false;
      }
    },
    async onStatusChange({ taskId, status }) {
      try {
        await tasksApi.updateStatus(taskId, status);
        const updated = this.kanbanTasks.map((t) =>
          t._id === taskId ? { ...t, status } : t
        );
        this.kanbanTasks = updated;
        this.$store.dispatch('notifications/show', { text: 'Status updated', color: 'success' });
      } catch (e) {
        this.$store.dispatch('notifications/show', {
          text: e.response?.data?.message || 'Error',
          color: 'error',
        });
      }
    },
    onSaved() {
      this.fetchTasks();
      if (this.tab === 1) this.fetchKanbanTasks();
    },
    async exportCsv() {
      try {
        const res = await tasksApi.exportCsv(this.filters);
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.$store.dispatch('notifications/show', { text: 'Export started', color: 'success' });
      } catch (e) {
        this.$store.dispatch('notifications/show', {
          text: e.response?.data?.message || 'Export failed',
          color: 'error',
        });
      }
    },
  },
};
</script>
