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
      
      <button type="button" class="select-btn" @click="$emit('select')">
        立即预约
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
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  overflow: hidden;
  border: 1px solid var(--m-border);
  transition: all var(--m-transition);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.service-package-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transition: all var(--m-transition);
}

.service-package-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--m-shadow-md);
  border-color: var(--m-accent);
}



.service-package-card:hover .package-icon {
  background-color: var(--m-accent);
  color: white;
}

/* 头部样式 */
.package-header {
  position: relative;
  padding: 1.5rem;
  border-bottom: 1px solid var(--m-border);
}

.package-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--m-radius-sm);
  background-color: var(--m-accent-light);
  color: var(--m-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all var(--m-transition);
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
  color: var(--m-text);
  margin-bottom: 0.75rem;
}

.package-description {
  color: var(--m-text-secondary);
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
  color: var(--m-text);
  font-size: 0.875rem;
}

.feature-item i {
  color: #10b981;
  font-size: 0.75rem;
}

/* 底部样式 */
.package-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--m-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  color: var(--m-text);
}

.currency {
  font-size: 1rem;
  color: var(--m-text-secondary);
}

.amount {
  font-size: 1.75rem;
  font-weight: 700;
}

.duration {
  color: var(--m-text-secondary);
  font-size: 0.875rem;
}

.select-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--m-accent-light);
  color: var(--m-accent);
  border: 1px solid var(--m-accent);
  border-radius: var(--m-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--m-transition);
}

.select-btn:hover {
  background-color: var(--m-accent);
  color: white;
}

.service-package-card:hover .select-btn {
  background-color: var(--m-accent);
  color: white;
}
</style>
