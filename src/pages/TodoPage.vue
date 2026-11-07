<script setup>
import { computed, nextTick, ref } from 'vue';
import TodoList from '../components/TodoList.vue';
import SearchBar from '../components/SearchBar.vue';
import AddTodoModal from '../components/AddTodoModal.vue';
import { useTodoStore } from '../stores/todo.js';

const todoStore = useTodoStore();

const query = ref('');
const status = ref('');

const modalOpen = ref(false);
const editingId = ref(null);
const addButton = ref(null);

const visibleTasks = computed(() => {
  const search = query.value.trim().toLowerCase();
  if (!search) return todoStore.userTasks;
  return todoStore.userTasks.filter((task) => task.title.toLowerCase().includes(search));
});

const activeTasks = computed(() => visibleTasks.value.filter((task) => !task.done));
const doneTasks = computed(() => visibleTasks.value.filter((task) => task.done));
const isSearching = computed(() => query.value.trim() !== '');

const summary = computed(() => {
  const total = todoStore.userTasks.length;
  if (!total) return 'Задач нет';
  return `Выполнено ${todoStore.doneCount} из ${total}`;
});

const editingTask = computed(() => (editingId.value === null ? null : todoStore.findTask(editingId.value)));

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

function toggleTask(id) {
  const task = todoStore.toggleTask(id);
  if (!task) return;
  focusById(`task-${id}-done`);
  announce(task.done ? `Задача «${task.title}» выполнена` : `Задача «${task.title}» снова активна`);
}

function deleteTask(id) {
  const ordered = [...activeTasks.value, ...doneTasks.value];
  const index = ordered.findIndex((task) => task.id === id);
  const neighbour = ordered[index + 1] || ordered[index - 1];

  const task = todoStore.removeTask(id);
  if (!task) return;
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
    todoStore.renameTask(editingTask.value.id, title);
    announce(`Задача переименована в «${title}»`);
  } else {
    todoStore.addTask(title);
    announce(`Задача «${title}» добавлена`);
  }
  closeModal();
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1 id="page-title" class="header__title" tabindex="-1">Мои задачи</h1>
      <p class="header__subtitle">{{ summary }}</p>
    </div>

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

    <AddTodoModal
      :open="modalOpen"
      :task="editingTask"
      @save="saveTask"
      @close="closeModal"
    />
  </div>
</template>
