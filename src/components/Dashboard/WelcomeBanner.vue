<template>
  <section class="welcome-section">
    <div class="welcome-banner">
      <div class="banner-content">
        <h1 class="welcome-title">欢迎回来，{{ username }}</h1>
        <p class="welcome-message">今天是 {{ todayDate }}，准备好开始您的游戏之旅了吗？</p>
      </div>
      <div class="banner-stats">
        <div class="stat-item">
          <span class="stat-value">{{ completedOrders }}</span>
          <span class="stat-label">已完成订单</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ ongoingOrders }}</span>
          <span class="stat-label">进行中订单</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userLevel }}</span>
          <span class="stat-label">会员等级</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { defineProps } from 'vue';

// 定义props
const props = defineProps({
  username: {
    type: String,
    required: true
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  ongoingOrders: {
    type: Number,
    default: 0
  },
  userLevel: {
    type: String,
    default: '普通会员'
  }
});

// 格式化日期
const todayDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  };
  return new Date().toLocaleDateString('zh-CN', options);
});
</script>

<style scoped>
/* 欢迎区域 */
.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: url('../../image/fengmian.png');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  border-radius: 0 1rem 1rem 0;
}

.banner-content {
  position: relative;
  z-index: 10;
  margin-bottom: 1.5rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.welcome-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.banner-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  position: relative;
  z-index: 10;
}

.stat-item {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (min-width: 768px) {
  .welcome-banner {
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .banner-content {
    margin-bottom: 0;
    max-width: 50%;
  }
  
  .welcome-title {
    font-size: 2.25rem;
  }
  
  .banner-stats {
    gap: 1.5rem;
  }
}
</style>
    