const TASKS_KEY = 'todo-tasks';
const THEME_KEY = 'todo-theme';

export function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(TASKS_KEY));
    if (!Array.isArray(data)) return [];

    return data
      .filter((task) => task
        && Number.isInteger(task.id)
        && typeof task.title === 'string'
        && task.title.trim() !== '')
      .map((task) => ({ id: task.id, title: task.title, done: task.done === true }));
  } catch (error) {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    return false;
  }
}

export function loadTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {}
}
