<template>
  <div class="testimonial-card">
    <div class="testimonial-header">
      <img :src="testimonial.avatar" :alt="testimonial.username" class="user-avatar">
      <div class="user-info">
        <h4 class="username">{{ testimonial.username }}</h4>
        <div class="service-type">{{ testimonial.service }}</div>
      </div>
      <div class="rating">
        <i class="fa fa-star" v-for="i in 5" :key="i" :class="{ 'filled': i <= testimonial.rating }"></i>
      </div>
    </div>
    
    <div class="testimonial-content">
      <p>{{ testimonial.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Testimonial {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  content: string;
  service: string;
}

const props = defineProps({
  testimonial: {
    type: Object as () => Testimonial,
    required: true
  }
});
</script>

<style scoped>
.testimonial-card {
  background-color: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 头部样式 */
.testimonial-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.2);
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.service-type {
  color: #94a3b8;
  font-size: 0.75rem;
}

.rating {
  color: #64748b;
  white-space: nowrap;
}

.rating .fa-star.filled {
  color: #f59e0b;
}

/* 内容样式 */
.testimonial-content p {
  color: #e2e8f0;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}
</style>
