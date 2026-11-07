<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  task: { type: Object, default: null },
});

const emit = defineEmits(['save', 'close']);

const dialog = ref(null);
const input = ref(null);
const title = ref('');
const error = ref('');

// Нативный <dialog> открывается методом showModal(), поэтому состояние из props синхронизируется вручную
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    title.value = props.task ? props.task.title : '';
    error.value = '';
    dialog.value.showModal();
    input.value.focus();
  } else if (dialog.value.open) {
    dialog.value.close();
  }
});

watch(title, () => {
  error.value = '';
});

function submit() {
  const value = title.value.trim();
  if (!value) {
    error.value = 'Введите название задачи';
    input.value.focus();
    return;
  }
  emit('save', value);
}

function cancel(event) {
  event.preventDefault();
  emit('close');
}
</script>

<template>
  <dialog ref="dialog" class="modal" aria-labelledby="task-dialog-title" @cancel="cancel">
    <form class="modal__form" novalidate @submit.prevent="submit">
      <h2 id="task-dialog-title" class="modal__title">
        {{ task ? 'Редактирование задачи' : 'Новая задача' }}
      </h2>
      <div class="form-field">
        <label class="form-field__label" for="task-title">Название</label>
        <input
          id="task-title"
          ref="input"
          v-model="title"
          class="form-field__input"
          name="title"
          type="text"
          maxlength="200"
          required
          autocomplete="off"
          aria-describedby="task-title-error"
          :aria-invalid="error ? 'true' : undefined"
        >
        <p id="task-title-error" class="form-field__error">{{ error }}</p>
      </div>
      <div class="modal__actions">
        <button type="button" class="button button--secondary" @click="emit('close')">Отмена</button>
        <button type="submit" class="button button--primary">{{ task ? 'Сохранить' : 'Добавить' }}</button>
      </div>
    </form>
  </dialog>
</template>
