<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user.js';

const userStore = useUserStore();
const router = useRouter();

const form = reactive({ email: '', password: '', confirm: '' });
const errors = ref({});
const pending = ref(false);

const fields = [
  { key: 'email', id: 'register-email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'password', id: 'register-password', label: 'Пароль', type: 'password', autocomplete: 'new-password' },
  { key: 'confirm', id: 'register-confirm', label: 'Подтверждение пароля', type: 'password', autocomplete: 'new-password' },
];

fields.forEach(({ key }) => {
  watch(() => form[key], () => {
    if (errors.value[key]) errors.value = { ...errors.value, [key]: '' };
  });
});

async function submit() {
  pending.value = true;
  const result = await userStore.register({ ...form });
  pending.value = false;

  if (!result.ok) {
    errors.value = result.errors;
    await nextTick();
    const firstInvalid = fields.find(({ key }) => result.errors[key]);
    document.getElementById(firstInvalid.id).focus();
    return;
  }

  router.push({ name: 'login', state: { registeredEmail: form.email.trim().toLowerCase() } });
}
</script>

<template>
  <div class="page page--narrow">
    <section class="auth-card" aria-labelledby="page-title">
      <h1 id="page-title" class="auth-card__title" tabindex="-1">Регистрация</h1>

      <form class="auth-card__form" novalidate @submit.prevent="submit">
        <div v-for="field in fields" :key="field.key" class="form-field">
          <label class="form-field__label" :for="field.id">{{ field.label }}</label>
          <input
            :id="field.id"
            v-model="form[field.key]"
            class="form-field__input"
            :type="field.type"
            :name="field.key"
            :autocomplete="field.autocomplete"
            required
            :aria-describedby="field.key === 'password' ? `${field.id}-hint ${field.id}-error` : `${field.id}-error`"
            :aria-invalid="errors[field.key] ? 'true' : undefined"
          >
          <p v-if="field.key === 'password'" :id="`${field.id}-hint`" class="form-field__hint">
            Не менее {{ userStore.minPasswordLength }} символов
          </p>
          <p :id="`${field.id}-error`" class="form-field__error">{{ errors[field.key] }}</p>
        </div>

        <button type="submit" class="button button--primary button--block" :disabled="pending">
          Создать аккаунт
        </button>
      </form>

      <p class="auth-card__footer">
        Уже есть аккаунт?
        <RouterLink class="text-link" :to="{ name: 'login' }">Войти</RouterLink>
      </p>
      <p class="auth-card__hint">
        Авторизация учебная: сервера нет, данные хранятся в localStorage этого браузера.
        Не используйте настоящий пароль.
      </p>
    </section>
  </div>
</template>
