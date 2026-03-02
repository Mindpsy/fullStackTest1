import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../../pages/login/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../../pages/register/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('../../widgets/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../../pages/dashboard/DashboardPage.vue'),
        beforeEnter: async (to, from, next) => {
          if (!store.hasModule('dashboard')) {
            const dashboard = await import('../../entities/dashboard/store').then((m) => m.default);
            store.registerModule('dashboard', dashboard);
          }
          next();
        },
      },
      {
        path: 'clients',
        name: 'Clients',
        component: () => import('../../pages/clients/ClientsPage.vue'),
        beforeEnter: async (to, from, next) => {
          if (!store.hasModule('client')) {
            const client = await import('../../entities/client/store').then((m) => m.default);
            store.registerModule('client', client);
          }
          next();
        },
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../../pages/tasks/TasksPage.vue'),
        beforeEnter: async (to, from, next) => {
          if (!store.hasModule('task')) {
            const task = await import('../../entities/task/store').then((m) => m.default);
            store.registerModule('task', task);
          }
          next();
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../../pages/profile/ProfilePage.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../../pages/users/UsersPage.vue'),
        meta: { admin: true },
        beforeEnter: async (to, from, next) => {
          if (!store.hasModule('usersList')) {
            const usersList = await import('../../entities/users-list/store').then((m) => m.default);
            store.registerModule('usersList', usersList);
          }
          next();
        },
      },
    ],
  },
];

const router = new VueRouter({ mode: 'history', base: process.env.BASE_URL, routes });

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = store.state.user?.user || (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')));
  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }
  if (to.meta.guest && token) {
    next('/dashboard');
    return;
  }
  if (to.meta.admin && user?.role !== 'admin') {
    next('/dashboard');
    return;
  }
  next();
});

export default router;
