<template>
  <!--
  【应用根组件】Delta Force 栗帽游戏服务平台
  功能：路由视图容器，负责全局路由切换动画 + 页面滚动到顶部
  交互：自动检测本地 Token，登录态恢复用户信息
  -->
  <router-view v-slot="{ Component, route }">
    <transition :name="(route.meta.transition as string) || 'fade'">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
  <ScrollToTop />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getAuthToken } from './api/token'
import { useUserStore } from './stores/user'
import ScrollToTop from './components/Common/ScrollToTop.vue'

// 【启动时自动恢复登录态】检测是否存在有效 Token，有则拉取服务端用户信息
onMounted(async () => {
  if (!getAuthToken()) return
  const userStore = useUserStore()
  try {
    await userStore.loadUserFromServer()
  } catch {
    /* 未登录或 token 失效时由后续请求处理 */
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

:root {
  --m-bg: #F7F7F8;
  --m-bg-secondary: #FFFFFF;
  --m-bg-tertiary: #F0F0F2;
  --m-text: #1A1A1A;
  --m-text-secondary: #5C5C5C;
  --m-text-muted: #909090;
  --m-border: #E2E2E4;
  --m-border-light: #EBEBED;
  --m-accent: #2563EB;
  --m-accent-hover: #1D4ED8;
  --m-accent-light: #EFF6FF;
  --m-success: #059669;
  --m-success-light: #ECFDF5;
  --m-warning: #D97706;
  --m-warning-light: #FFFBEB;
  --m-danger: #DC2626;
  --m-danger-light: #FEF2F2;
  --m-radius: 12px;
  --m-radius-sm: 8px;
  --m-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --m-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --m-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  --m-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
  --m-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --m-transition-slow: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  --m-font-display: 'Instrument Serif', Georgia, serif;
  --m-font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--m-font-body);
  font-size: 15px;
  line-height: 1.6;
  color: var(--m-text);
  background-color: var(--m-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: var(--m-accent);
  color: white;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #C8C8CC;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #A8A8AC;
}

input, button, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

img {
  max-width: 100%;
  height: auto;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>