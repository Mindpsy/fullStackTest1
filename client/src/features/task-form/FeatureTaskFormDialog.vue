<template>
  <v-dialog v-model="visible" max-width="500" persistent>
    <v-card>
      <v-card-title>Add task</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="form.title" label="Title" :rules="[r.required]" />
          <v-textarea v-model="form.description" label="Description" rows="2" />
          <v-select
            v-model="form.clientId"
            :items="clients"
            label="Client"
            item-value="value"
            item-text="text"
            :rules="[r.required]"
          />
          <v-select
            v-model="form.status"
            :items="statusItems"
            label="Status"
          />
          <v-select
            v-model="form.priority"
            :items="priorityItems"
            label="Priority"
          />
          <v-text-field
            v-model="form.dueDate"
            label="Due date"
            type="date"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="visible = false">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { tasksApi } from '../../entities/task/api';
import { TASK_STATUSES, PRIORITIES } from '../../shared/config/constants';

export default {
  name: 'FeatureTaskFormDialog',
  props: {
    value: { type: Boolean, default: false },
    clients: { type: Array, default: () => [] },
  },
  data: () => ({
    valid: false,
    loading: false,
    form: {
      title: '',
      description: '',
      clientId: null,
      status: 'pending',
      priority: 'medium',
      dueDate: null,
    },
    r: { required: (v) => !!v || 'Required' },
    statusItems: TASK_STATUSES.map((s) => ({ value: s.value, text: s.text })),
    priorityItems: PRIORITIES.map((p) => ({ value: p.value, text: p.text })),
  }),
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
      if (val) {
        this.form = {
          title: '',
          description: '',
          clientId: this.clients.length ? this.clients[0].value : null,
          status: 'pending',
          priority: 'medium',
          dueDate: null,
        };
      }
    },
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        const payload = {
          title: this.form.title,
          description: this.form.description || undefined,
          clientId: this.form.clientId,
          status: this.form.status,
          priority: this.form.priority,
        };
        if (this.form.dueDate) {
          const d = new Date(this.form.dueDate);
          if (!isNaN(d.getTime())) payload.dueDate = d.toISOString();
        }
        await tasksApi.create(payload);
        this.$store.dispatch('notifications/show', { text: 'Task created', color: 'success' });
        this.visible = false;
        this.$emit('saved');
      } catch (e) {
        this.$store.dispatch('notifications/show', {
          text: e.response?.data?.message || 'Error',
          color: 'error',
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
