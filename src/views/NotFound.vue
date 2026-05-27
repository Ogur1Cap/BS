<!--
  【404 页面】未找到页面时的兜底展示
  功能：404动画 + 返回首页 / 返回上一页 按钮
-->
<template>
  <div class="not-found-container">
    <!-- 主内容区域 -->
    <div class="not-found-content">
      <!-- 404数字动画 -->
      <div class="error-number">
        <span class="number-4">4</span>
        <span class="number-0">0</span>
        <span class="number-4">4</span>
      </div>
      
      <!-- 标题和描述 -->
      <div class="error-info">
        <h1 class="error-title">页面不存在</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被移除。</p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a 
          href="/dashboard" 
          class="primary-button"
        >
          <i class="fa fa-home mr-2"></i>
          返回首页
        </a>
        <a 
          href="/customer-service" 
          class="secondary-button"
        >
          <i class="fa fa-headset mr-2"></i>
          联系客服
        </a>
      </div>
      
      <!-- 搜索建议 -->
      <div class="search-suggestion">
        <p class="suggestion-text">或者尝试搜索相关内容</p>
        <div class="search-input">
          <input type="text" placeholder="搜索..." class="search-field">
          <button class="search-button">
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="background-effects">
      <!-- 浮动粒子 -->
      <div class="floating-particles">
        <div v-for="i in 15" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
      
      <!-- 渐变背景 -->
      <div class="gradient-background"></div>
      
      <!-- 动态光效 -->
      <div class="light-effects">
        <div class="light light-1"></div>
        <div class="light light-2"></div>
        <div class="light light-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 粒子样式生成
const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const top = Math.random() * 100
  const duration = Math.random() * 10 + 5
  const delay = Math.random() * 5
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

// 页面加载动画
const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
/* 页面容器 */
.not-found-container {
  min-height: 100vh;
  background-color: var(--m-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: var(--m-font-body);
}

/* 主内容区域 */
.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.8s ease-out;
}

/* 404数字动画 */
.error-number {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  gap: 0.5rem;
}

.number-4, .number-0 {
  font-size: clamp(4rem, 15vw, 8rem);
  font-weight: 900;
  background: linear-gradient(135deg, var(--m-accent), #06b6d4, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: numberFloat 3s ease-in-out infinite;
}

.number-0 {
  animation-delay: 0.5s;
}

.number-4:last-child {
  animation-delay: 1s;
}

/* 错误信息 */
.error-info {
  margin-bottom: 3rem;
}

.error-title {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 700;
  color: var(--m-text);
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.125rem;
  color: var(--m-text-secondary);
  line-height: 1.6;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.primary-button, .secondary-button {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  border-radius: var(--m-radius);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--m-transition);
  border: 1px solid var(--m-border);
  cursor: pointer;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.primary-button {
  background-color: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, var(--m-accent), var(--m-accent-hover));
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  background-color: var(--m-accent-hover);
  border-color: var(--m-accent-hover);
}

.primary-button:hover::before {
  transform: scaleY(1);
}

.secondary-button {
  background-color: var(--m-bg-secondary);
  color: var(--m-text);
  border-color: var(--m-border);
}

.secondary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.secondary-button:hover {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.secondary-button:hover::before {
  transform: scaleY(1);
}

/* 搜索建议 */
.search-suggestion {
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
}

.search-suggestion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.search-suggestion:hover::before {
  transform: scaleY(1);
}

.suggestion-text {
  color: var(--m-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.search-input {
  display: flex;
  gap: 0.5rem;
}

.search-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--m-radius-sm);
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text);
  font-size: 0.875rem;
  transition: border-color var(--m-transition);
}

.search-field:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.search-button {
  padding: 0.75rem 1rem;
  background-color: var(--m-accent);
  border: 1px solid var(--m-accent);
  border-radius: var(--m-radius-sm);
  color: white;
  cursor: pointer;
  transition: all var(--m-transition);
}

.search-button:hover {
  background-color: var(--m-accent-hover);
  border-color: var(--m-accent-hover);
}

/* 背景效果 */
.background-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 渐变背景 */
.gradient-background {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
}

/* 浮动粒子 */
.floating-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: floatParticle linear infinite;
}

/* 动态光效 */
.light-effects {
  position: absolute;
  inset: 0;
}

.light {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.1;
  animation: lightPulse 8s ease-in-out infinite;
}

.light-1 {
  width: 200px;
  height: 200px;
  background: var(--m-accent);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.light-2 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.light-3 {
  width: 150px;
  height: 150px;
  background: #14b8a6;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

/* 动画定义 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes numberFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes floatParticle {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

@keyframes lightPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.15;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-button, .secondary-button {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
  
  .search-input {
    flex-direction: column;
  }
}
</style>