import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Пароль хранится только в виде хеша SHA-256, но это учебная схема без сервера
async function hashPassword(email, password) {
  const bytes = new TextEncoder().encode(`${email}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const currentUserId = ref(null);

  const currentUser = computed(() => users.value.find((user) => user.id === currentUserId.value) || null);
  const isAuthenticated = computed(() => currentUser.value !== null);

  function findByEmail(email) {
    const normalized = normalizeEmail(email);
    return users.value.find((user) => user.email === normalized) || null;
  }

  function validateRegistration({ email, password, confirm }) {
    const errors = {};
    const normalized = normalizeEmail(email);

    if (!normalized) {
      errors.email = 'Введите email';
    } else if (!EMAIL_PATTERN.test(normalized)) {
      errors.email = 'Введите email в формате name@example.com';
    } else if (findByEmail(normalized)) {
      errors.email = 'Пользователь с таким email уже зарегистрирован';
    }

    if (!password) {
      errors.password = 'Введите пароль';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Пароль должен содержать не менее ${MIN_PASSWORD_LENGTH} символов`;
    }

    if (!confirm) {
      errors.confirm = 'Повторите пароль';
    } else if (confirm !== password) {
      errors.confirm = 'Пароли не совпадают';
    }

    return errors;
  }

  async function register(form) {
    const errors = validateRegistration(form);
    if (Object.keys(errors).length) return { ok: false, errors };

    const email = normalizeEmail(form.email);
    const passwordHash = await hashPassword(email, form.password);

    if (findByEmail(email)) {
      return { ok: false, errors: { email: 'Пользователь с таким email уже зарегистрирован' } };
    }

    users.value.push({
      id: createId(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
    return { ok: true, errors: {} };
  }

  async function login(email, password) {
    const user = findByEmail(email);
    if (!user) return false;

    const passwordHash = await hashPassword(user.email, password);
    if (passwordHash !== user.passwordHash) return false;

    currentUserId.value = user.id;
    return true;
  }

  function logout() {
    currentUserId.value = null;
  }

  return {
    users,
    currentUserId,
    currentUser,
    isAuthenticated,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    register,
    login,
    logout,
  };
}, {
  persist: {
    pick: ['users', 'currentUserId'],
  },
});
