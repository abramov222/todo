<script setup>
const query = defineModel({ type: String, default: '' });
</script>

<template>
  <div class="search">
    <label for="search" class="visually-hidden">Поиск задач</label>
    <svg class="search__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
    <input
      id="search"
      v-model="query"
      class="search__input"
      type="search"
      placeholder="Найти задачу..."
      autocomplete="off"
    >
  </div>
</template>
