const TASKS_KEY = 'todo-tasks';
const THEME_KEY = 'todo-theme';

const root = document.documentElement;
const themeToggle = document.querySelector('.js-theme-toggle');
const summary = document.querySelector('.js-summary');
const searchInput = document.querySelector('.js-search');
const addButton = document.querySelector('.js-add-task');
const status = document.querySelector('.js-status');
const template = document.querySelector('#task-template');

const sections = {
  active: {
    list: document.querySelector('.js-active-list'),
    count: document.querySelector('.js-active-count'),
    empty: document.querySelector('.js-active-empty'),
    emptyText: 'Активных задач нет',
  },
  done: {
    list: document.querySelector('.js-done-list'),
    count: document.querySelector('.js-done-count'),
    empty: document.querySelector('.js-done-empty'),
    emptyText: 'Выполненных задач нет',
  },
};

const dialog = document.querySelector('.js-task-dialog');
const form = document.querySelector('.js-task-form');
const dialogTitle = document.querySelector('.js-dialog-title');
const taskInput = document.querySelector('.js-task-input');
const taskError = document.querySelector('.js-task-error');
const submitButton = document.querySelector('.js-submit-task');
const closeButton = document.querySelector('.js-close-dialog');

let tasks = loadTasks();
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
let query = '';
let editingId = null;

// Хранилище

function loadTasks() {
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

function saveTasks() {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    announce('Не удалось сохранить задачи');
  }
}

// Отрисовка

function getVisibleTasks() {
  const search = query.trim().toLowerCase();
  if (!search) return tasks;
  return tasks.filter((task) => task.title.toLowerCase().includes(search));
}

function createTaskElement(task) {
  const item = template.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector('[data-role="done"]');
  const title = item.querySelector('[data-role="title"]');
  const editButton = item.querySelector('[data-action="edit"]');
  const deleteButton = item.querySelector('[data-action="delete"]');
  const prefix = `task-${task.id}`;

  item.dataset.id = task.id;
  item.dataset.done = String(task.done);

  checkbox.id = `${prefix}-done`;
  checkbox.checked = task.done;

  title.id = `${prefix}-title`;
  title.htmlFor = checkbox.id;
  title.textContent = task.title;

  editButton.id = `${prefix}-edit`;
  editButton.setAttribute('aria-labelledby', `${editButton.id} ${title.id}`);

  deleteButton.id = `${prefix}-delete`;
  deleteButton.setAttribute('aria-labelledby', `${deleteButton.id} ${title.id}`);

  return item;
}

function renderSection(section, items) {
  section.list.replaceChildren(...items.map(createTaskElement));
  section.count.textContent = items.length;
  section.empty.hidden = items.length > 0;
  section.empty.textContent = query.trim() ? 'Ничего не найдено' : section.emptyText;
}

function render() {
  const visible = getVisibleTasks();
  renderSection(sections.active, visible.filter((task) => !task.done));
  renderSection(sections.done, visible.filter((task) => task.done));

  const doneCount = tasks.filter((task) => task.done).length;
  summary.textContent = tasks.length
    ? `Выполнено ${doneCount} из ${tasks.length}`
    : 'Задач нет';
}

function announce(message) {
  status.textContent = '';
  setTimeout(() => {
    status.textContent = message;
  }, 100);
}

function focusById(id, fallback = addButton) {
  const element = document.getElementById(id);
  (element || fallback).focus();
}

// Действия с задачами

function addTask(title) {
  tasks.push({ id: nextId, title, done: false });
  nextId += 1;
  saveTasks();
  render();
  announce(`Задача «${title}» добавлена`);
}

function renameTask(id, title) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.title = title;
  saveTasks();
  render();
  announce(`Задача переименована в «${title}»`);
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
  focusById(`task-${id}-done`);
  announce(task.done ? `Задача «${task.title}» выполнена` : `Задача «${task.title}» снова активна`);
}

function deleteTask(id) {
  const items = [...document.querySelectorAll('[data-task]')];
  const index = items.findIndex((item) => Number(item.dataset.id) === id);
  const neighbour = items[index + 1] || items[index - 1];
  const task = tasks.find((item) => item.id === id);

  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  render();

  if (neighbour) {
    focusById(`task-${neighbour.dataset.id}-done`);
  } else {
    addButton.focus();
  }
  announce(`Задача «${task.title}» удалена`);
}

function handleListChange(event) {
  const checkbox = event.target.closest('[data-role="done"]');
  if (!checkbox) return;
  toggleTask(Number(checkbox.closest('[data-task]').dataset.id));
}

function handleListClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const id = Number(button.closest('[data-task]').dataset.id);
  if (button.dataset.action === 'edit') openDialog(id);
  if (button.dataset.action === 'delete') deleteTask(id);
}

// Модальное окно

function setError(message) {
  taskError.textContent = message;
  if (message) {
    taskInput.setAttribute('aria-invalid', 'true');
  } else {
    taskInput.removeAttribute('aria-invalid');
  }
}

function openDialog(id = null) {
  const task = tasks.find((item) => item.id === id);
  editingId = task ? task.id : null;

  dialogTitle.textContent = task ? 'Редактирование задачи' : 'Новая задача';
  submitButton.textContent = task ? 'Сохранить' : 'Добавить';
  taskInput.value = task ? task.title : '';
  setError('');

  dialog.showModal();
  taskInput.focus();
}

function handleSubmit(event) {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    setError('Введите название задачи');
    taskInput.focus();
    return;
  }

  if (editingId === null) {
    addTask(title);
  } else {
    renameTask(editingId, title);
  }
  closeDialog();
}

function closeDialog() {
  dialog.close();

  if (editingId === null) {
    addButton.focus();
  } else {
    focusById(`task-${editingId}-edit`);
  }
  editingId = null;
}

// Тема

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

function toggleTheme() {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {}
}

// Подписки на события

applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', toggleTheme);

searchInput.addEventListener('input', () => {
  query = searchInput.value;
  render();
});

addButton.addEventListener('click', () => openDialog());
closeButton.addEventListener('click', closeDialog);
form.addEventListener('submit', handleSubmit);
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDialog();
});
taskInput.addEventListener('input', () => setError(''));

Object.values(sections).forEach((section) => {
  section.list.addEventListener('change', handleListChange);
  section.list.addEventListener('click', handleListClick);
});

render();
