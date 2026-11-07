import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from './user.js';

export const useTodoStore = defineStore('todo', () => {
  const tasks = ref([]);
  const nextId = ref(1);

  const userStore = useUserStore();

  // Все операции работают только с задачами текущего пользователя
  const userTasks = computed(() => tasks.value.filter((task) => task.userId === userStore.currentUserId));
  const doneCount = computed(() => userTasks.value.filter((task) => task.done).length);

  function findTask(id) {
    return userTasks.value.find((task) => task.id === id) || null;
  }

  function addTask(title) {
    if (!userStore.currentUserId) return null;

    const id = nextId.value;
    tasks.value.push({
      id,
      userId: userStore.currentUserId,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    });
    nextId.value += 1;
    return findTask(id);
  }

  function renameTask(id, title) {
    const task = findTask(id);
    if (task) task.title = title;
    return task;
  }

  function toggleTask(id) {
    const task = findTask(id);
    if (task) task.done = !task.done;
    return task;
  }

  function removeTask(id) {
    const task = findTask(id);
    if (task) tasks.value = tasks.value.filter((item) => item !== task);
    return task;
  }

  return {
    tasks,
    nextId,
    userTasks,
    doneCount,
    findTask,
    addTask,
    renameTask,
    toggleTask,
    removeTask,
  };
}, {
  persist: {
    pick: ['tasks', 'nextId'],
  },
});
