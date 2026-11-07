<script setup>
import TodoItem from './TodoItem.vue';

defineProps({
  title: { type: String, required: true },
  headingId: { type: String, required: true },
  tasks: { type: Array, required: true },
  emptyText: { type: String, required: true },
});

const emit = defineEmits(['toggle', 'edit', 'delete']);
</script>

<template>
  <section class="task-section" :aria-labelledby="headingId">
    <h2 :id="headingId" class="task-section__title" tabindex="-1">
      {{ title }} <span class="task-section__count">{{ tasks.length }}</span>
    </h2>
    <ul v-if="tasks.length" class="task-section__list">
      <TodoItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </ul>
    <p v-else class="task-section__empty">{{ emptyText }}</p>
  </section>
</template>
