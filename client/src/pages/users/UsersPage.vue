<template>
  <div>
    <h1 class="text-h4 mb-4 app-heading-gradient">Users</h1>
    <v-card class="app-glass-card">
      <v-card-title class="app-card-title">
        <v-spacer />
        <v-btn color="primary" @click="dialogCreate = true">+ Add user</v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-key="_id"
      >
        <template slot="item.role" slot-scope="{ item }">
          <v-chip small class="app-chip-teal">{{ item.role }}</v-chip>
        </template>
        <template slot="item.actions" slot-scope="{ item }">
          <v-btn icon small @click="openEdit(item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="dialogCreate" max-width="500" persistent>
      <v-card class="app-glass-card">
        <v-card-title class="app-card-title">Add user</v-card-title>
        <v-card-text>
          <v-form ref="formCreate">
            <v-text-field v-model="createForm.email" label="Email" type="email" :rules="[r.required]" />
            <v-text-field v-model="createForm.name" label="Name" :rules="[r.required]" />
            <v-text-field v-model="createForm.password" label="Password" type="password" :rules="[r.required, r.password]" />
            <v-select v-model="createForm.role" :items="roleItems" label="Role" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogCreate = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="createUser">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogEdit" max-width="500" persistent>
      <v-card v-if="editUser" class="app-glass-card">
        <v-card-title class="app-card-title">Edit user</v-card-title>
        <v-card-text>
          <v-form ref="formEdit">
            <v-text-field v-model="editForm.name" label="Name" :rules="[r.required]" />
            <v-select v-model="editForm.role" :items="roleItems" label="Role" />
            <v-text-field v-model="editForm.password" label="New password (optional)" type="password" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogEdit = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="updateUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { usersApi } from '../../entities/user/api';
import { mapState } from 'vuex';

export default {
  name: 'UsersPage',
  data: () => ({
    loading: false,
    saving: false,
    dialogCreate: false,
    dialogEdit: false,
    editUser: null,
    createForm: { email: '', name: '', password: '', role: 'manager' },
    editForm: { name: '', role: 'manager', password: '' },
    roleItems: [
      { value: 'admin', text: 'Admin' },
      { value: 'manager', text: 'Manager' },
    ],
    r: {
      required: (v) => !!v || 'Required',
      password: (v) => !v || v.length >= 6 || 'Min 6 characters',
    },
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Email', value: 'email' },
      { text: 'Role', value: 'role' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
  }),
  computed: {
    ...mapState('usersList', ['list']),
    users() {
      return this.list;
    },
  },
  mounted() {
    this.$store.dispatch('usersList/fetchUsers');
  },
  methods: {
    openEdit(user) {
      this.editUser = user;
      this.editForm = { name: user.name, role: user.role, password: '' };
      this.dialogEdit = true;
    },
    async createUser() {
      if (!this.$refs.formCreate.validate()) return;
      this.saving = true;
      try {
        await usersApi.create(this.createForm);
        this.$store.dispatch('notifications/show', { text: 'User created', color: 'success' });
        this.dialogCreate = false;
        this.createForm = { email: '', name: '', password: '', role: 'manager' };
        await this.$store.dispatch('usersList/fetchUsers');
      } catch (e) {
        this.$store.dispatch('notifications/show', { text: e.response?.data?.message || 'Error', color: 'error' });
      } finally {
        this.saving = false;
      }
    },
    async updateUser() {
      if (!this.$refs.formEdit.validate()) return;
      this.saving = true;
      try {
        const payload = { name: this.editForm.name, role: this.editForm.role };
        if (this.editForm.password) payload.password = this.editForm.password;
        await usersApi.update(this.editUser._id, payload);
        this.$store.dispatch('notifications/show', { text: 'Saved', color: 'success' });
        this.dialogEdit = false;
        await this.$store.dispatch('usersList/fetchUsers');
      } catch (e) {
        this.$store.dispatch('notifications/show', { text: e.response?.data?.message || 'Error', color: 'error' });
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
