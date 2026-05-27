<template>
  <section class="welcome-banner">
    <div class="banner-content">
      <h1 class="banner-title">欢迎回来，{{ username }}</h1>
      <p class="banner-date">{{ todayDate }}</p>
    </div>
    <div class="banner-stats">
      <div class="stat">
        <span class="stat-value">{{ completedOrders }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ ongoingOrders }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ userLevel }}</span>
        <span class="stat-label">会员等级</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  username: string
  completedOrders?: number
  ongoingOrders?: number
  userLevel?: string
}>()

const todayDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
  return new Date().toLocaleDateString('zh-CN', options)
})
</script>

<style scoped>
.welcome-banner {
  padding: 1.75rem 2rem;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .welcome-banner {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.banner-title {
  font-family: var(--m-font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--m-text);
  margin-bottom: 0.25rem;
}

.banner-date {
  font-size: 0.875rem;
  color: var(--m-text-muted);
}

.banner-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--m-accent);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--m-text-muted);
}
</style>
    