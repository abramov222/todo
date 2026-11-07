<script setup>
import { nextTick, ref, watch } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import ThemeToggle from './components/ThemeToggle.vue';
import { useUserStore } from './stores/user.js';
import { loadTheme, saveTheme } from './storage.js';

const userStore = useUserStore();
const router = useRouter();
const theme = ref(loadTheme());

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  saveTheme(value);
}, { immediate: true });

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

function logout() {
  userStore.logout();
  router.push({ name: 'login' });
}

// После перехода фокус переносится на заголовок новой страницы, чтобы скринридер её озвучил
router.afterEach(async (to, from) => {
  if (!from.matched.length) return;
  await nextTick();
  const heading = document.getElementById('page-title');
  if (heading) heading.focus();
});
</script>

<template>
  <div class="app">
    <header class="site-header">
      <nav class="nav" aria-label="Основная навигация">
        <ul class="nav__list">
          <li v-if="userStore.isAuthenticated">
            <RouterLink class="nav__link" :to="{ name: 'todo' }">Задачи</RouterLink>
          </li>
          <template v-else>
            <li>
              <RouterLink class="nav__link" :to="{ name: 'login' }">Вход</RouterLink>
            </li>
            <li>
              <RouterLink class="nav__link" :to="{ name: 'register' }">Регистрация</RouterLink>
            </li>
          </template>
          <li>
            <RouterLink class="nav__link" :to="{ name: 'about' }">О приложении</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="site-header__actions">
        <template v-if="userStore.isAuthenticated">
          <span class="site-header__user" :title="userStore.currentUser.email">
            {{ userStore.currentUser.email }}
          </span>
          <button type="button" class="button button--secondary" @click="logout">Выйти</button>
        </template>
        <ThemeToggle :theme="theme" @toggle="toggleTheme" />
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>
