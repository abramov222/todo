<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: { type: Object, required: true },
});

const emit = defineEmits(['toggle', 'edit', 'delete']);

const prefix = computed(() => `task-${props.task.id}`);
</script>

<template>
  <li class="task" :class="{ 'task--done': task.done }" :data-id="task.id">
    <input
      :id="`${prefix}-done`"
      class="task__checkbox"
      type="checkbox"
      :checked="task.done"
      @change="emit('toggle', task.id)"
    >
    <label :id="`${prefix}-title`" class="task__title" :for="`${prefix}-done`">{{ task.title }}</label>
    <div class="task__actions">
      <button
        :id="`${prefix}-edit`"
        type="button"
        class="icon-button"
        :aria-labelledby="`${prefix}-edit ${prefix}-title`"
        @click="emit('edit', task.id)"
      >
        <span class="visually-hidden">Редактировать задачу</span>
        <svg class="icon-button__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
      <button
        :id="`${prefix}-delete`"
        type="button"
        class="icon-button icon-button--danger"
        :aria-labelledby="`${prefix}-delete ${prefix}-title`"
        @click="emit('delete', task.id)"
      >
        <span class="visually-hidden">Удалить задачу</span>
        <svg class="icon-button__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <path d="M3 6h18" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  </li>
</template>
