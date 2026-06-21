<script setup lang="ts">
defineProps<{
  title: string
  /** Optional small label above the title (e.g. "线路 / Route") */
  eyebrow?: string
}>()
</script>

<template>
  <div class="pp-feature-card">
    <div v-if="eyebrow" class="pp-feature-eyebrow">{{ eyebrow }}</div>
    <h3 class="pp-feature-title">{{ title }}</h3>
    <div class="pp-feature-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.pp-feature-card {
  position: relative;
  padding: 1.25rem 1.25rem 1.1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  background: var(--vp-c-bg-elv);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.pp-feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--vp-c-brand-1) 6%, transparent),
    transparent 60%
  );
  opacity: 0.6;
}
.pp-feature-card:hover {
  border-color: color-mix(in oklch, var(--vp-c-brand-1) 35%, transparent);
  transform: translateY(-2px);
  box-shadow:
    0 18px 36px -22px color-mix(in oklch, var(--vp-c-brand-1) 50%, transparent);
}
.pp-feature-eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.pp-feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.45rem;
  color: var(--vp-c-text-1);
}
.pp-feature-body {
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  line-height: 1.6;
}
.pp-feature-body :deep(p) { margin: 0; }
.pp-feature-body :deep(p + p) { margin-top: 0.5rem; }
</style>
