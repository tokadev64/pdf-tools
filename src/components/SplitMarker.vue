<script setup lang="ts">
defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    class="split-marker"
    :class="{ 'split-marker--active': active }"
    type="button"
    :aria-label="active ? '分割点を解除' : '分割点を設定'"
    @click="emit('toggle')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z" />
    </svg>
    <div v-if="active" class="split-line" />
  </button>
</template>

<style scoped>
.split-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
  min-width: 28px;
}

.split-marker:hover {
  color: #4a7cf7;
}

.split-marker--active {
  color: #4a7cf7;
}

.split-line {
  width: 2px;
  height: 100%;
  min-height: 40px;
  background: #4a7cf7;
  border-radius: 1px;
}
</style>
