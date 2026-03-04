<template>
  <div>
    <h1 class="text-h4 mb-4 app-heading-gradient">Profile</h1>
    <v-card max-width="500" class="app-glass-card">
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-avatar size="80" class="mb-4">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" />
            <v-icon v-else size="48">mdi-account</v-icon>
          </v-avatar>
          <v-file-input
            v-model="avatarFile"
            label="Avatar"
            accept="image/*"
            prepend-icon="mdi-camera"
            @change="uploadAvatar"
          />
          <v-text-field v-model="form.name" label="Name" :rules="[r.required]" />
          <v-text-field v-model="form.email" label="Email" type="email" :rules="[r.required, r.email]" />
          <v-text-field
            v-model="form.password"
            label="New password (leave blank to keep)"
            type="password"
            :rules="form.password ? [r.password] : []"
          />
        </v-form>
        <v-alert v-if="message" :type="messageType" dense class="mt-2">{{ message }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="loading" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { authApi } from '../../entities/user/api';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProfilePage',
  data: () => ({
    valid: false,
    loading: false,
    avatarFile: null,
    form: {
      name: '',
      email: '',
      password: '',
      avatarUrl: '',
    },
    message: '',
    messageType: 'success',
    r: {
      required: (v) => !!v || 'Required',
      email: (v) => /.+@.+\..+/.test(v) || 'Invalid email',
      password: (v) => !v || v.length >= 6 || 'Min 6 characters',
    },
  }),
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    ...mapActions('user', ['setUser']),
    loadUser() {
      const u = this.currentUser;
      if (u) {
        this.form.name = u.name || '';
        this.form.email = u.email || '';
        if (u.avatar) {
          this.form.avatarUrl = u.avatar.startsWith('http') ? u.avatar : `${window.location.origin}${u.avatar.startsWith('/') ? '' : '/'}${u.avatar}`;
        } else {
          this.form.avatarUrl = '';
        }
      }
    },
    async uploadAvatar() {
      if (!this.avatarFile || !this.avatarFile.length) return;
      const file = this.avatarFile instanceof File ? this.avatarFile : this.avatarFile[0];
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const res = await authApi.uploadAvatar(formData);
        this.setUser(res.data);
        this.form.avatarUrl = res.data.avatar
          ? (res.data.avatar.startsWith('http') ? res.data.avatar : `${window.location.origin}${res.data.avatar.startsWith('/') ? '' : '/'}${res.data.avatar}`)
          : this.form.avatarUrl;
        this.$store.dispatch('notifications/show', { text: 'Avatar updated', color: 'success' });
      } catch (e) {
        this.$store.dispatch('notifications/show', { text: e.response?.data?.message || 'Upload failed', color: 'error' });
      }
      this.avatarFile = null;
    },
    async save() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      this.message = '';
      try {
        const payload = { name: this.form.name, email: this.form.email };
        if (this.form.password) payload.password = this.form.password;
        const res = await authApi.updateProfile(payload);
        this.setUser(res.data);
        this.$store.dispatch('notifications/show', { text: 'Profile saved', color: 'success' });
      } catch (e) {
        this.message = e.response?.data?.message || 'Error';
        this.messageType = 'error';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
