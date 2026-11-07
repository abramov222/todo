import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '../stores/user.js';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import TodoPage from '../pages/TodoPage.vue';
import AboutPage from '../pages/AboutPage.vue';

const routes = [
  { path: '/', redirect: { name: 'todo' } },
  {
    path: '/todo',
    name: 'todo',
    component: TodoPage,
    meta: { title: 'Мои задачи', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: 'Вход', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { title: 'Регистрация', guestOnly: true },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: { title: 'О приложении' },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'todo' } },
];

// Hash-режим: GitHub Pages отдаёт index.html только для корня, а адрес после # обрабатывает сам роутер
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return { name: 'todo' };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — To-Do List` : 'To-Do List';
});

export default router;
