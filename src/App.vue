<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getAuthToken } from './api/token'
import { useUserStore } from './stores/user'

// 刷新页面后根据 token 拉取最新资料，避免 Header 与各页数据不一致
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
/* 导入Font Awesome图标库 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 基础样式 */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>