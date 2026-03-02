<template>
  <v-card class="mt-4">
    <v-card-text>
      <v-row v-if="loading">
        <v-col><v-progress-linear indeterminate color="primary" /></v-col>
      </v-row>
      <v-row v-else>
        <v-col v-for="col in columns" :key="col.status" md="4">
          <v-card outlined class="pa-2">
            <v-card-title class="text-subtitle-1">{{ col.title }}</v-card-title>
            <draggable
              :list="col.tasks"
              group="tasks"
              class="min-height-200"
              @change="(e) => onDragChange(col.status, e)"
            >
              <v-card
                v-for="task in col.tasks"
                :key="task._id"
                :data-id="task._id"
                class="ma-1 pa-2"
                outlined
                small
              >
                <div class="font-weight-medium">{{ task.title }}</div>
                <div class="caption">
                  <v-chip x-small>{{ task.priority }}</v-chip>
                  {{ task.clientId?.name }}
                </div>
                <div class="caption">{{ formatDateShort(task.dueDate) }}</div>
              </v-card>
            </draggable>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import draggable from 'vuedraggable';
import { formatDateShort } from '../../shared/lib/format';

const STATUSES = ['pending', 'in_progress', 'completed'];
const TITLES = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

export default {
  name: 'WidgetTaskBoard',
  components: { draggable },
  props: {
    tasks: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  computed: {
    columns() {
      return STATUSES.map((status) => ({
        status,
        title: TITLES[status],
        tasks: this.tasks.filter((t) => t.status === status),
      }));
    },
  },
  methods: {
    formatDateShort,
    onDragChange(newStatus, evt) {
      if (evt.added) {
        const task = evt.added.element;
        const taskId = task._id;
        if (taskId) this.$emit('status-change', { taskId, status: newStatus });
      }
    },
  },
};
</script>

<style scoped>
.min-height-200 {
  min-height: 200px;
}
</style>
