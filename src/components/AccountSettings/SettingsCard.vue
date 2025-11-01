<template>
  <div class="settings-card">
    <div class="card-header" v-if="title || description">
      <h2 class="card-title" v-if="title">{{ title }}</h2>
      <p class="card-description" v-if="description">{{ description }}</p>
    </div>
    <slot></slot> <!-- 卡片内容插槽 -->
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  danger: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.settings-card {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: rgba(17, 24, 37, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.settings-card:last-child {
  margin-bottom: 0;
}

/* 危险区域卡片样式 */
.settings-card.danger-card {
  border-color: rgba(239, 68, 68, 0.3);
  background-color: rgba(37, 15, 15, 0.5);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
}

.card-title::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-right: 0.75rem;
}

/* 危险区域标题特殊样式 */
.danger-card .card-title::before {
  background-color: #ef4444;
}

.card-description {
  margin: 0;
  color: #9ca3af;
  font-size: 0.9375rem;
}
</style>