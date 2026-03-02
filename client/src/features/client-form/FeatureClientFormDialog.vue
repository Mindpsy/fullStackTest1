<template>
  <v-dialog v-model="visible" max-width="500" persistent>
    <v-card>
      <v-card-title>{{ mode === 'create' ? 'Add client' : 'Edit client' }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="form.name" label="Name" :rules="[r.required]" />
          <v-text-field v-model="form.email" label="Email" type="email" />
          <v-text-field v-model="form.phone" label="Phone" />
          <v-text-field v-model="form.company" label="Company" />
          <v-select
            v-model="form.status"
            :items="clientStatusItems"
            label="Status"
          />
          <v-textarea v-model="form.notes" label="Notes" rows="2" />
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
import { clientsApi } from '../../entities/client/api';
import { CLIENT_STATUSES } from '../../shared/config/constants';

export default {
  name: 'FeatureClientFormDialog',
  props: {
    value: { type: Boolean, default: false },
    mode: { type: String, default: 'create' },
    clientId: { type: String, default: null },
  },
  data: () => ({
    valid: false,
    loading: false,
    form: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
      notes: '',
    },
    r: { required: (v) => !!v || 'Required' },
    clientStatusItems: CLIENT_STATUSES.map((s) => ({ value: s.value, text: s.text })),
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
      if (val) this.load();
    },
  },
  methods: {
    async load() {
      if (this.mode === 'edit' && this.clientId) {
        const res = await clientsApi.getById(this.clientId);
        const c = res.data;
        this.form = {
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          status: c.status || 'lead',
          notes: c.notes || '',
        };
      } else {
        this.form = {
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'lead',
          notes: '',
        };
      }
    },
    async submit() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        if (this.mode === 'create') {
          await clientsApi.create(this.form);
        } else {
          await clientsApi.update(this.clientId, this.form);
        }
        this.$store.dispatch('notifications/show', { text: 'Saved', color: 'success' });
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
