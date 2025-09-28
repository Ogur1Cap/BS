<template>
  <div class="service-package-card">
    <div class="package-header">
      <div class="package-icon">
        <i :class="['fa', icon]"></i>
      </div>
      <div class="package-popular" v-if="popular">
        <span>热门选择</span>
      </div>
    </div>
    
    <div class="package-body">
      <h3 class="package-title">{{ title }}</h3>
      <p class="package-description">{{ description }}</p>
      
      <div class="package-features">
        <div class="feature-item" v-for="(feature, index) in featuresList" :key="index">
          <i class="fa fa-check"></i>
          <span>{{ feature }}</span>
        </div>
      </div>
    </div>
    
    <div class="package-footer">
      <div class="package-price">
        <span class="currency">¥</span>
        <span class="amount">{{ price }}</span>
        <span class="duration">{{ duration }}</span>
      </div>
      
      <button class="select-btn" @click="$emit('select')">
        选择服务
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  features: {
    type: String,
    required: true
  },
  popular: {
    type: Boolean,
    default: false
  }
});

// 将特性字符串转换为数组
const featuresList = computed(() => {
  return props.features.split('|');
});
</script>

<style scoped>
.service-package-card {
  background-color: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.service-package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.3);
}

.service-package-card:hover .package-icon {
  background-color: #3b82f6;
  color: white;
}

/* 头部样式 */
.package-header {
  position: relative;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.package-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.package-popular {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.package-popular span {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f59e0b;
  color: white;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 主体样式 */
.package-body {
  padding: 1.5rem;
  flex: 1;
}

.package-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
}

.package-description {
  color: #94a3b8;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
}

.package-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.feature-item i {
  color: #10b981;
  font-size: 0.75rem;
}

/* 底部样式 */
.package-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  color: white;
}

.currency {
  font-size: 1rem;
  color: #94a3b8;
}

.amount {
  font-size: 1.75rem;
  font-weight: 700;
}

.duration {
  color: #94a3b8;
  font-size: 0.875rem;
}

.select-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover {
  background-color: #3b82f6;
  color: white;
}

.service-package-card:hover .select-btn {
  background-color: #3b82f6;
  color: white;
}
</style>
