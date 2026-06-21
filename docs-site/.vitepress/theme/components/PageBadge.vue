<script setup lang="ts">
defineProps<{
  /** Optional accent variant; defaults to brand terracotta */
  variant?: 'brand' | 'success' | 'info' | 'neutral'
}>()
</script>

<template>
  <span class="pp-page-badge" :data-variant="variant ?? 'brand'">
    <slot />
  </span>
</template>

<style scoped>
.pp-page-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: color-mix(in oklch, var(--vp-c-brand-1) 35%, transparent);
}
.pp-page-badge[data-variant='success'] {
  background: color-mix(in oklch, #16a34a 14%, transparent);
  color: #16a34a;
  border-color: color-mix(in oklch, #16a34a 35%, transparent);
}
.dark .pp-page-badge[data-variant='success'] {
  color: #4ade80;
  background: color-mix(in oklch, #4ade80 14%, transparent);
  border-color: color-mix(in oklch, #4ade80 32%, transparent);
}
.pp-page-badge[data-variant='info'] {
  background: color-mix(in oklch, #0284c7 14%, transparent);
  color: #0284c7;
  border-color: color-mix(in oklch, #0284c7 32%, transparent);
}
.pp-page-badge[data-variant='neutral'] {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border-color: var(--vp-c-border);
}
</style>
