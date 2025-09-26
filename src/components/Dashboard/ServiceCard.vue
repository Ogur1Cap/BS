<template>
  <router-link :to="link" class="service-card">
    <div class="service-icon">
      <i :class="icon"></i>
    </div>
    <h3 class="service-title">{{ title }}</h3>
    <p class="service-desc">{{ description }}</p>
    <div class="service-arrow">
      <i class="fa fa-arrow-right"></i>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// 定义props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.service-card {
  background-color: #1f2937;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 0.5rem;
}

.service-desc {
  color: #9ca3af;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  flex: 1;
}

.service-arrow {
  display: flex;
  justify-content: flex-end;
  color: #3b82f6;
  transition: transform 0.3s ease;
}

.service-card:hover .service-arrow {
  transform: translateX(5px);
}
</style>
    