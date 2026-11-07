const THEME_KEY = 'todo-theme';

export function loadTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {}
}
