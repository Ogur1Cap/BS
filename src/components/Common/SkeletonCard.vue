<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-thumb"></div>
    <div class="skeleton-body">
      <div class="skeleton-line w-70"></div>
      <div class="skeleton-line w-40"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-thumb {
  aspect-ratio: 16 / 10;
  background: linear-gradient(90deg, var(--m-border-light) 25%, var(--m-bg-tertiary) 50%, var(--m-border-light) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--m-border-light) 25%, var(--m-bg-tertiary) 50%, var(--m-border-light) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.w-70 { width: 70%; }
.w-40 { width: 40%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
