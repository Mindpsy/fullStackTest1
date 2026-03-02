<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4" hover @click="$emit('navigate', '/clients')">
        <v-card-title class="text-h6">Clients</v-card-title>
        <v-card-text class="text-h4">{{ stats?.clientsTotal ?? '-' }}</v-card-text>
        <v-progress-linear v-if="loading" indeterminate color="primary" />
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4" hover @click="$emit('navigate', '/tasks')">
        <v-card-title class="text-h6">Tasks</v-card-title>
        <v-card-text class="text-h4">{{ stats?.tasksTotal ?? '-' }}</v-card-text>
        <v-progress-linear v-if="loading" indeterminate color="primary" />
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Clients by status</v-card-title>
        <v-card-text v-if="stats?.clientsByStatus" class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(count, status) in stats.clientsByStatus"
            :key="status"
            class="ma-1"
            @click="$emit('navigate', '/clients', { status })"
          >
            {{ status }}: {{ count }}
          </v-chip>
        </v-card-text>
        <v-progress-linear v-else-if="loading" indeterminate color="primary" />
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Tasks by status</v-card-title>
        <v-card-text v-if="stats?.tasksByStatus" class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(count, status) in stats.tasksByStatus"
            :key="status"
            class="ma-1"
            @click="$emit('navigate', '/tasks', { status })"
          >
            {{ status }}: {{ count }}
          </v-chip>
        </v-card-text>
        <v-progress-linear v-else-if="loading" indeterminate color="primary" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'WidgetStatsCards',
  props: {
    stats: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
};
</script>
