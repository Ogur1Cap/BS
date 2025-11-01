<template>
  <div class="settings-sidebar">
    <ul class="settings-nav">
      <li 
        class="nav-item"
        :class="{ active: activeTab === 'profile' }"
        @click="handleTabChange('profile')"
      >
        <i class="fa fa-user"></i>
        <span>个人信息</span>
      </li>
      <li 
        class="nav-item"
        :class="{ active: activeTab === 'security' }"
        @click="handleTabChange('security')"
      >
        <i class="fa fa-lock"></i>
        <span>安全设置</span>
      </li>
      <li 
        class="nav-item"
        :class="{ active: activeTab === 'notification' }"
        @click="handleTabChange('notification')"
      >
        <i class="fa fa-bell"></i>
        <span>通知设置</span>
      </li>
      <li 
        class="nav-item"
        :class="{ active: activeTab === 'connections' }"
        @click="handleTabChange('connections')"
      >
        <i class="fa fa-link"></i>
        <span>账号关联</span>
      </li>
      <li 
        class="nav-item danger-zone"
        :class="{ active: activeTab === 'danger' }"
        @click="handleTabChange('danger')"
      >
        <i class="fa fa-exclamation-triangle"></i>
        <span>安全中心</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 接收当前激活的选项卡
const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
});

// 触发选项卡切换事件
const emit = defineEmits<{
  (e: 'tab-change', tab: string): void
}>();

const handleTabChange = (tab: string) => {
  emit('tab-change', tab);
};
</script>

<style scoped>
/* 从原页面迁移侧边导航样式 */
.settings-sidebar {
  width: 260px;
  flex-shrink: 0;
}

.settings-nav {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  overflow: hidden;
}

.nav-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover:not(.active) {
  color: #f3f4f6;
  background-color: rgba(55, 65, 81, 0.2);
}

.nav-item.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}

.nav-item i {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

.nav-item.danger-zone {
  margin-top: 1rem;
  color: #ef4444;
}

.nav-item.danger-zone.active {
  background-color: rgba(239, 68, 68, 0.1);
  border-left-color: #ef4444;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .settings-sidebar {
    width: 100%;
  }
}
</style>