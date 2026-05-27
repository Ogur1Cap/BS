<template>
  <router-link :to="link" class="service-card">
    <div class="card-icon-wrap">
      <i :class="'fa ' + icon"></i>
    </div>
    <div class="card-content">
      <span class="card-title">{{ title }}</span>
      <span class="card-desc">{{ description }}</span>
    </div>
    <span class="card-indicator">→</span>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  link: string
  icon: string
}>()
</script>

<style scoped>
.service-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--m-accent-light), transparent 80%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card:hover {
  border-color: var(--m-accent);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.service-card:hover::before {
  opacity: 1;
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--m-accent-light);
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.service-card:hover .card-icon-wrap {
  background: var(--m-accent);
  border-color: var(--m-accent);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.service-card:hover .card-icon-wrap i {
  color: white;
}

.card-icon-wrap i {
  font-size: 1.05rem;
  color: var(--m-accent);
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  position: relative;
  z-index: 1;
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--m-text);
  line-height: 1.3;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--m-text-muted);
  line-height: 1.4;
}

.card-indicator {
  font-size: 1.1rem;
  color: var(--m-text-muted);
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;
}

.service-card:hover .card-indicator {
  opacity: 1;
  transform: translateX(0);
  color: var(--m-accent);
}
</style>
