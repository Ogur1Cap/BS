<template>
  <div class="skeleton-table" aria-hidden="true">
    <div class="skeleton-header">
      <div class="skeleton-cell w-15"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-15"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-10"></div>
    </div>
    <div
      v-for="i in rows"
      :key="i"
      class="skeleton-row"
    >
      <div class="skeleton-cell w-15"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-15"></div>
      <div class="skeleton-cell w-20"></div>
      <div class="skeleton-cell w-10"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rows: { type: Number, default: 5 }
})
</script>

<style scoped>
.skeleton-table {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px;
  overflow: hidden;
}

.skeleton-header {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: var(--m-bg-tertiary);
  border-bottom: 1px solid var(--m-border);
}

.skeleton-row {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--m-border-light);
}

.skeleton-row:last-child { border-bottom: none; }

.skeleton-cell {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--m-border-light) 25%, var(--m-bg-tertiary) 50%, var(--m-border-light) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-10 { flex: 0 0 10%; }
.w-15 { flex: 0 0 15%; }
.w-20 { flex: 0 0 20%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
