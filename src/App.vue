<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import TodoList from './components/TodoList.vue';
import SearchBar from './components/SearchBar.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import AddTodoModal from './components/AddTodoModal.vue';
import { loadTasks, saveTasks, loadTheme, saveTheme } from './storage.js';

const tasks = ref(loadTasks());
const query = ref('');
const theme = ref(loadTheme());
const status = ref('');

const modalOpen = ref(false);
const editingId = ref(null);
const addButton = ref(null);

let nextId = tasks.value.reduce((max, task) => Math.max(max, task.id), 0) + 1;

const visibleTasks = computed(() => {
  const search = query.value.trim().toLowerCase();
  if (!search) return tasks.value;
  return tasks.value.filter((task) => task.title.toLowerCase().includes(search));
});

const activeTasks = computed(() => visibleTasks.value.filter((task) => !task.done));
const doneTasks = computed(() => visibleTasks.value.filter((task) => task.done));
const isSearching = computed(() => query.value.trim() !== '');

const summary = computed(() => {
  if (!tasks.value.length) return 'Задач нет';
  const doneCount = tasks.value.filter((task) => task.done).length;
  return `Выполнено ${doneCount} из ${tasks.value.length}`;
});

const editingTask = computed(() => tasks.value.find((task) => task.id === editingId.value) || null);

// Любое изменение списка сразу записывается в localStorage
watch(tasks, (value) => {
  if (!saveTasks(value)) announce('Не удалось сохранить задачи');
}, { deep: true });

// Тема применяется к <html> и запоминается
watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  saveTheme(value);
}, { immediate: true });

function announce(message) {
  status.value = '';
  setTimeout(() => {
    status.value = message;
  }, 100);
}

async function focusById(id) {
  await nextTick();
  const element = document.getElementById(id);
  (element || addButton.value).focus();
}

function findTask(id) {
  return tasks.value.find((task) => task.id === id);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

function toggleTask(id) {
  const task = findTask(id);
  if (!task) return;
  task.done = !task.done;
  focusById(`task-${id}-done`);
  announce(task.done ? `Задача «${task.title}» выполнена` : `Задача «${task.title}» снова активна`);
}

function deleteTask(id) {
  const ordered = [...activeTasks.value, ...doneTasks.value];
  const index = ordered.findIndex((task) => task.id === id);
  const neighbour = ordered[index + 1] || ordered[index - 1];
  const task = findTask(id);

  tasks.value = tasks.value.filter((item) => item.id !== id);
  focusById(neighbour ? `task-${neighbour.id}-done` : '');
  announce(`Задача «${task.title}» удалена`);
}

function openModal(id = null) {
  editingId.value = id;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  focusById(editingId.value === null ? '' : `task-${editingId.value}-edit`);
  editingId.value = null;
}

function saveTask(title) {
  if (editingTask.value) {
    editingTask.value.title = title;
    announce(`Задача переименована в «${title}»`);
  } else {
    tasks.value.push({ id: nextId, title, done: false });
    nextId += 1;
    announce(`Задача «${title}» добавлена`);
  }
  closeModal();
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div>
        <h1 class="header__title">Мои задачи</h1>
        <p class="header__subtitle">{{ summary }}</p>
      </div>
      <ThemeToggle :theme="theme" @toggle="toggleTheme" />
    </header>

    <main class="main">
      <div class="toolbar">
        <SearchBar v-model="query" />
        <button ref="addButton" type="button" class="button button--primary" @click="openModal()">
          <svg class="button__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Добавить задачу
        </button>
      </div>

      <TodoList
        title="Активные"
        heading-id="active-heading"
        :tasks="activeTasks"
        :empty-text="isSearching ? 'Ничего не найдено' : 'Активных задач нет'"
        @toggle="toggleTask"
        @edit="openModal"
        @delete="deleteTask"
      />

      <TodoList
        title="Выполненные"
        heading-id="done-heading"
        :tasks="doneTasks"
        :empty-text="isSearching ? 'Ничего не найдено' : 'Выполненных задач нет'"
        @toggle="toggleTask"
        @edit="openModal"
        @delete="deleteTask"
      />

      <p class="visually-hidden" role="status" aria-live="polite">{{ status }}</p>
    </main>
  </div>

  <AddTodoModal
    :open="modalOpen"
    :task="editingTask"
    @save="saveTask"
    @close="closeModal"
  />
</template>
