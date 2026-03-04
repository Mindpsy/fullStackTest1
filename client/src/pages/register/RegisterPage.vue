<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Register</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="name"
                  label="Name"
                  :rules="[rules.required]"
                  prepend-icon="mdi-account"
                />
                <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  prepend-icon="mdi-email"
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  :rules="[rules.required, rules.password]"
                  prepend-icon="mdi-lock"
                  @keyup.enter="submit"
                />
              </v-form>
              <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" :loading="loading" @click="submit">Register</v-btn>
            </v-card-actions>
            <v-divider />
            <v-card-actions>
              <span class="text-body-2 mr-2">Already have an account?</span>
              <v-btn text color="primary" to="/login">Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { authApi } from '../../entities/user/api';
import { mapActions } from 'vuex';

export default {
  name: 'RegisterPage',
  data: () => ({
    name: '',
    email: '',
    password: '',
    valid: false,
    loading: false,
    error: '',
    rules: {
      required: (v) => !!v || 'Required',
      email: (v) => /.+@.+\..+/.test(v) || 'Invalid email',
      password: (v) => (v && v.length >= 6) || 'Min 6 characters',
    },
  }),
  methods: {
    ...mapActions('user', ['setUser']),
    async submit() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      this.error = '';
      try {
        await authApi.register({ name: this.name, email: this.email, password: this.password });
        const res = await authApi.login({ email: this.email, password: this.password });
        localStorage.setItem('token', res.data.token);
        this.setUser(res.data.user);
        this.$router.push('/dashboard');
      } catch (e) {
        this.error = e.response?.data?.message || 'Registration failed';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
