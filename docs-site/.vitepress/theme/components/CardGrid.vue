<script setup lang="ts">
defineProps<{ /** columns at desktop */ cols?: 2 | 3 }>()
</script>

<template>
  <div class="pp-card-grid" :data-cols="cols ?? 3">
    <slot />
  </div>
</template>

<style scoped>
.pp-card-grid {
  display: grid;
  gap: 1rem;
  margin: 1.25rem 0 1.5rem;
}
.pp-card-grid[data-cols='2'] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pp-card-grid[data-cols='3'] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 768px) {
  .pp-card-grid[data-cols='2'],
  .pp-card-grid[data-cols='3'] { grid-template-columns: 1fr; }
}
</style>
