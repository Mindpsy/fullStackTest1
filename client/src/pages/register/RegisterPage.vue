<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5">
          <v-card class="app-glass-card">
            <div class="register-header">
              <span class="register-title">Register</span>
            </div>
            <v-card-text class="pt-6">
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="name"
                  label="Name"
                  :rules="[rules.required]"
                  prepend-icon="mdi-account"
                  outlined
                  dense
                  background-color="rgba(10, 25, 40, 0.8)"
                  color="primary"
                />
                <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  autocomplete="email"
                  :rules="[rules.required, rules.email]"
                  prepend-icon="mdi-email"
                  outlined
                  dense
                  background-color="rgba(10, 25, 40, 0.8)"
                  color="primary"
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  autocomplete="new-password"
                  :rules="[rules.required, rules.password]"
                  prepend-icon="mdi-lock"
                  outlined
                  dense
                  background-color="rgba(10, 25, 40, 0.8)"
                  color="primary"
                  @keyup.enter="submit"
                />
              </v-form>
              <v-alert v-if="error" type="error" dense class="mt-2" rounded="pill">{{ error }}</v-alert>
            </v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-spacer />
              <v-btn color="primary" :loading="loading" rounded large @click="submit">Register</v-btn>
            </v-card-actions>
            <v-divider class="mx-4" style="border-color: rgba(47, 107, 104, 0.5)" />
            <v-card-actions class="px-4 py-4">
              <span class="text-body-2 mr-2" style="color: #99c9c9">Already have an account?</span>
              <v-btn text color="primary" to="/login" rounded>Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.register-header {
  background: rgba(0, 206, 209, 0.15);
  border: 1px solid rgba(56, 178, 172, 0.6);
  border-radius: 28px 28px 0 0;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(44, 92, 90, 0.5);
}
.register-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #b2f0e6;
  letter-spacing: -0.5px;
}
</style>

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
