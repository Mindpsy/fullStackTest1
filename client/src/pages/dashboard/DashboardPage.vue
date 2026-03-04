<template>
  <div>
    <h1 class="text-h4 mb-4">Dashboard</h1>
    <widget-stats-cards :stats="stats" :loading="loading" @navigate="navigate" />
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <widget-recent-list
          title="Recent clients"
          :items="recentClients"
          type="client"
          link-to="/clients"
        />
      </v-col>
      <v-col cols="12" md="6">
        <widget-recent-list
          title="Recent tasks"
          :items="recentTasks"
          type="task"
          link-to="/tasks"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WidgetStatsCards from '../../widgets/stats-cards/WidgetStatsCards.vue';
import WidgetRecentList from '../../widgets/recent-list/WidgetRecentList.vue';

export default {
  name: 'DashboardPage',
  components: { WidgetStatsCards, WidgetRecentList },
  data: () => ({ loading: false }),
  computed: {
    ...mapState('dashboard', ['stats', 'recentClients', 'recentTasks']),
  },
  async mounted() {
    this.loading = true;
    try {
      await Promise.all([
        this.$store.dispatch('dashboard/fetchStats'),
        this.$store.dispatch('dashboard/fetchRecent'),
      ]);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    navigate(path, query) {
      this.$router.push({ path, query }).catch(() => {});
    },
  },
};
</script>
