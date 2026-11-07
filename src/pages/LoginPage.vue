<script setup>
import { ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const registeredEmail = typeof history.state?.registeredEmail === 'string' ? history.state.registeredEmail : '';

const email = ref(registeredEmail);
const password = ref('');
const error = ref('');
const pending = ref(false);
const emailInput = ref(null);

const notice = registeredEmail ? 'Аккаунт создан. Введите пароль, чтобы войти.' : '';

watch([email, password], () => {
  error.value = '';
});

function redirectTarget() {
  const target = route.query.redirect;
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) return target;
  return { name: 'todo' };
}

async function submit() {
  if (!email.value.trim() || !password.value) {
    error.value = 'Введите email и пароль';
    emailInput.value.focus();
    return;
  }

  pending.value = true;
  const ok = await userStore.login(email.value, password.value);
  pending.value = false;

  if (!ok) {
    error.value = 'Неверный email или пароль';
    emailInput.value.focus();
    return;
  }
  router.push(redirectTarget());
}
</script>

<template>
  <div class="page page--narrow">
    <section class="auth-card" aria-labelledby="page-title">
      <h1 id="page-title" class="auth-card__title" tabindex="-1">Вход</h1>
      <p v-if="notice" class="auth-card__notice" role="status">{{ notice }}</p>

      <form class="auth-card__form" novalidate @submit.prevent="submit">
        <div class="form-field">
          <label class="form-field__label" for="login-email">Email</label>
          <input
            id="login-email"
            ref="emailInput"
            v-model="email"
            class="form-field__input"
            type="email"
            name="email"
            autocomplete="username"
            required
            aria-describedby="login-error"
            :aria-invalid="error ? 'true' : undefined"
          >
        </div>

        <div class="form-field">
          <label class="form-field__label" for="login-password">Пароль</label>
          <input
            id="login-password"
            v-model="password"
            class="form-field__input"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            aria-describedby="login-error"
            :aria-invalid="error ? 'true' : undefined"
          >
        </div>

        <p id="login-error" class="form-field__error" role="alert">{{ error }}</p>

        <button type="submit" class="button button--primary button--block" :disabled="pending">
          Войти
        </button>
      </form>

      <p class="auth-card__footer">
        Нет аккаунта?
        <RouterLink class="text-link" :to="{ name: 'register' }">Зарегистрироваться</RouterLink>
      </p>
      <p class="auth-card__hint">
        Авторизация учебная: аккаунты хранятся только в этом браузере.
        Используйте вымышленный email и пароль, который больше нигде не применяется.
      </p>
    </section>
  </div>
</template>
