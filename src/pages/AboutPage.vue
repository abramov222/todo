<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '../stores/user.js';
import { useTodoStore } from '../stores/todo.js';

const userStore = useUserStore();
const todoStore = useTodoStore();

const totalTasks = computed(() => todoStore.tasks.length);
const myTasks = computed(() => todoStore.userTasks.length);
const progress = computed(() => (myTasks.value ? Math.round((todoStore.doneCount / myTasks.value) * 100) : 0));

const stats = computed(() => {
  const items = [
    { label: 'Аккаунтов в этом браузере', value: userStore.users.length },
    { label: 'Задач у всех пользователей', value: totalTasks.value },
  ];
  if (userStore.isAuthenticated) {
    items.push({ label: 'Ваших задач', value: myTasks.value });
    items.push({ label: 'Из них выполнено', value: todoStore.doneCount });
  }
  return items;
});

const features = [
  { title: 'Личные списки', text: 'Каждый пользователь видит и меняет только свои задачи. Задачи других аккаунтов в том же браузере скрыты.' },
  { title: 'Поиск', text: 'Фильтрация по названию прямо во время ввода, отдельно в активных и выполненных задачах.' },
  { title: 'Две темы', text: 'Светлая и тёмная палитры с контрастом текста не ниже 4.5:1, выбор запоминается.' },
  { title: 'Клавиатура', text: 'Все действия доступны с клавиатуры, фокус виден, после удаления и закрытия окна он не теряется.' },
];

const history = [
  { lab: 'Лаба №4', title: 'Vanilla JS и Sass', text: 'Разметка, стили на Sass по БЭМ, темы и требования доступности A1–A7.' },
  { lab: 'Лаба №6', title: 'Vue 3 и Vite', text: 'Интерфейс разбит на компоненты, данные передаются через props и события.' },
  { lab: 'Лаба №7', title: 'Pinia и Vue Router', text: 'Общее состояние вынесено в сторы, появились страницы, вход и личные задачи.' },
];

const stack = ['Vue 3', 'Vite', 'Pinia', 'pinia-plugin-persistedstate', 'Vue Router', 'Sass', 'GitHub Pages'];
</script>

<template>
  <div class="page about">
    <section class="about__hero" aria-labelledby="page-title">
      <p class="about__eyebrow">О приложении</p>
      <h1 id="page-title" class="about__title" tabindex="-1">To-Do List</h1>
      <p class="about__lead">
        Небольшой список задач, который вырос из учебного макета: сначала обычный JavaScript,
        затем компоненты Vue, а теперь общее состояние в Pinia, несколько страниц и отдельные списки
        для разных пользователей.
      </p>
      <RouterLink
        class="button button--primary about__cta"
        :to="userStore.isAuthenticated ? { name: 'todo' } : { name: 'register' }"
      >
        {{ userStore.isAuthenticated ? 'Перейти к задачам' : 'Создать учебный аккаунт' }}
      </RouterLink>
    </section>

    <section class="about__section" aria-labelledby="stats-title">
      <h2 id="stats-title" class="about__heading">Статистика</h2>
      <dl class="stats">
        <div v-for="item in stats" :key="item.label" class="stats__item">
          <dt class="stats__label">{{ item.label }}</dt>
          <dd class="stats__value">{{ item.value }}</dd>
        </div>
      </dl>
      <div v-if="userStore.isAuthenticated && myTasks" class="progress">
        <div class="progress__header">
          <span id="progress-label">Ваш прогресс</span>
          <span>{{ progress }}%</span>
        </div>
        <div
          class="progress__track"
          role="progressbar"
          aria-labelledby="progress-label"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="progress"
        >
          <div class="progress__bar" :style="{ width: `${progress}%` }" />
        </div>
      </div>
    </section>

    <section class="about__section" aria-labelledby="features-title">
      <h2 id="features-title" class="about__heading">Возможности</h2>
      <ul class="feature-grid">
        <li v-for="feature in features" :key="feature.title" class="feature-grid__item">
          <h3 class="feature-grid__title">{{ feature.title }}</h3>
          <p class="feature-grid__text">{{ feature.text }}</p>
        </li>
      </ul>
    </section>

    <section class="about__section" aria-labelledby="history-title">
      <h2 id="history-title" class="about__heading">История разработки</h2>
      <ol class="timeline">
        <li v-for="step in history" :key="step.lab" class="timeline__item">
          <span class="timeline__badge">{{ step.lab }}</span>
          <h3 class="timeline__title">{{ step.title }}</h3>
          <p class="timeline__text">{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="stack-title">
      <h2 id="stack-title" class="about__heading">Технологии</h2>
      <ul class="chips">
        <li v-for="item in stack" :key="item" class="chips__item">{{ item }}</li>
      </ul>
    </section>

    <section class="about__section about__note" aria-labelledby="auth-title">
      <h2 id="auth-title" class="about__heading">Про авторизацию</h2>
      <p>
        Вход здесь учебный: сервера нет, аккаунты и задачи лежат в <code>localStorage</code> этого браузера.
        Пароль сохраняется в виде хеша, но любой, у кого есть доступ к браузеру, может прочитать или
        изменить эти данные. Для проверки используйте только вымышленные email и пароли.
      </p>
    </section>
  </div>
</template>
