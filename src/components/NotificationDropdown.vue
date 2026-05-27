<template>
  <div class="notification-container">
    <!-- 通知按钮 -->
    <button 
      class="notification-btn" 
      aria-label="通知"
      @click="toggleDropdown"
      @keydown.enter="toggleDropdown"
    >
      <FontAwesomeIcon icon="bell" />
      <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
    </button>
    
    <!-- 通知下拉菜单 -->
    <div 
      class="notification-dropdown" 
      v-if="isOpen"
      @click.stop
    >
      <!-- 下拉菜单头部 -->
      <div class="dropdown-header">
        <h3 class="header-title">通知</h3>
        <button 
          class="mark-all-read"
          @click="handleMarkAllRead"
          :disabled="isLoading"
          v-if="unreadCount > 0"
        >
          <span v-if="!isLoading">全部标为已读</span>
          <span v-if="isLoading" class="loading">
            <i class="fa fa-spinner fa-spin"></i>
          </span>
        </button>
      </div>
      
      <!-- 通知列表 -->
      <div class="notification-list">
        <!-- 加载状态 -->
        <div class="loading-state" v-if="isLoading && items.length === 0">
          <FontAwesomeIcon icon="spinner" spin />
          <span>加载通知中...</span>
        </div>
        
        <!-- 空状态 -->
        <div class="empty-state" v-if="!isLoading && items.length === 0">
          <FontAwesomeIcon icon="bell" />
          <p>暂无通知</p>
        </div>
        
        <!-- 通知项（仅预览最近 8 条，完整列表见通知中心） -->
        <div 
          class="notification-item"
          v-for="notification in previewList"
          :key="notification.id"
          :class="{ 'unread': !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <!-- 通知类型图标 -->
          <div class="notification-icon" :class="getNotificationTypeClass(notification.type)">
            <FontAwesomeIcon :icon="getNotificationIcon(notification.type)" />
          </div>
          
          <!-- 通知内容 -->
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.content }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="notification-actions">
            <button 
              class="action-btn delete-btn"
              type="button"
              :disabled="deletingId === notification.id"
              @click.stop="handleDeleteNotification(notification.id)"
              :aria-label="deletingId === notification.id ? '正在删除' : '删除通知'"
            >
              <FontAwesomeIcon 
                :icon="deletingId === notification.id ? 'spinner' : 'trash'" 
                :spin="deletingId === notification.id"
              />
            </button>
            <button 
              class="action-btn read-btn"
              @click.stop="handleMarkAsRead(notification.id)"
              aria-label="标记为已读"
              v-if="!notification.isRead"
            >
              <FontAwesomeIcon icon="check" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 查看全部链接 -->
      <div class="dropdown-footer" v-if="items.length > 0">
        <router-link to="/notifications" class="view-all">查看全部通知</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notifications';
import { notificationsApi } from '../api/notificationsApi';
import type { Notification } from '../types/notification';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const notificationStore = useNotificationStore();
const { items, unreadCount } = storeToRefs(notificationStore);

/** 下拉内只展示最近几条，减少首屏高度 */
const previewList = computed(() => items.value.slice(0, 8));

const isOpen = ref(false);
const isLoading = ref(true);
/** 单条删除中，避免连点 */
const deletingId = ref<string | null>(null);

const router = useRouter();
// 浏览器下 setInterval 返回 number，与 Node 类型定义中的 Timeout 不同，这里显式标注避免 vue-tsc 报错
let pollTimer: number | null = null;

// 切换下拉菜单
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    void refreshForOpen();
  }
};

async function refreshForOpen() {
  isLoading.value = true;
  try {
    await notificationStore.refreshList();
  } finally {
    isLoading.value = false;
  }
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return 'shopping-cart';
    case 'message':
      return 'comment';
    case 'system':
      return 'info-circle';
    default:
      return 'bell';
  }
};

// 获取通知类型样式
const getNotificationTypeClass = (type: string) => {
  switch (type) {
    case 'order':
      return 'type-order';
    case 'message':
      return 'type-message';
    case 'system':
      return 'type-system';
    default:
      return '';
  }
};

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
};

// 标记通知为已读
const handleMarkAsRead = async (notificationId: string) => {
  try {
    const list = await notificationsApi.markAsRead(notificationId);
    notificationStore.applyListFromApi(list);
  } catch (error) {
    console.error('标记通知为已读失败:', error);
  }
};

// 标记所有通知为已读
const handleMarkAllRead = async () => {
  try {
    isLoading.value = true;
    const list = await notificationsApi.markAllAsRead();
    notificationStore.applyListFromApi(list);
  } catch (error) {
    console.error('标记所有通知为已读失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 删除通知（确认 + 同步顶栏未读数）
const handleDeleteNotification = async (notificationId: string) => {
  if (!window.confirm('删除这条通知？')) return;
  if (deletingId.value) return;
  deletingId.value = notificationId;
  try {
    const list = await notificationsApi.deleteNotification(notificationId);
    notificationStore.applyListFromApi(list);
    void notificationStore.refreshUnreadCount().catch(() => {});
  } catch (error) {
    console.error('删除通知失败:', error);
  } finally {
    deletingId.value = null;
  }
};

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  // 如果是未读通知，先标记为已读
  if (!notification.isRead) {
    handleMarkAsRead(notification.id);
  }
  
  // 根据通知类型跳转到相应页面
  if (notification.type === 'order' && notification.relatedId) {
    router.push(`/orders/${notification.relatedId}`);
  } else if (notification.type === 'message' && notification.relatedId) {
    router.push('/notifications');
  } else if (notification.type === 'system') {
    router.push('/notifications');
  }
  
  // 关闭下拉菜单
  isOpen.value = false;
};

onMounted(() => {
  isLoading.value = true;
  void notificationStore
    .refreshList()
    .catch(() => {})
    .finally(() => {
      isLoading.value = false;
    });

  // 定时同步未读角标（与通知中心、后端数据一致）
  pollTimer = window.setInterval(() => {
    void notificationStore.refreshUnreadCount().catch(() => {});
  }, 50000);

  document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    if (container && !container.contains(e.target as Node)) {
      isOpen.value = false;
    }
  });
});

onUnmounted(() => {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
</script>

<style scoped>
.notification-container {
  position: relative;
}

/* 通知按钮 */
.notification-btn {
  position: relative;
  background: none;
  border: none;
  color: var(--m-text-secondary);
  font-size: 1.125rem;
  cursor: pointer;
  transition: all var(--m-transition);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  color: var(--m-accent);
  background-color: var(--m-accent-light);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.25rem;
  height: 1.25rem;
  background-color: var(--m-danger);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transform: translate(30%, -30%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 通知下拉菜单 */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  max-width: 90vw;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  box-shadow: var(--m-shadow-lg);
  border: 1px solid var(--m-border);
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

/* 下拉菜单头部 */
.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--m-border);
}

.header-title {
  font-weight: 600;
  color: var(--m-text);
  margin: 0;
}

.mark-all-read {
  background: none;
  border: none;
  color: var(--m-accent);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--m-radius-sm);
  transition: all var(--m-transition);
}

.mark-all-read:hover {
  background-color: var(--m-accent-light);
}

.mark-all-read:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading i {
  font-size: 0.875rem;
}

/* 通知列表 */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 加载状态 */
.loading-state {
  padding: 2rem;
  text-align: center;
  color: var(--m-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-state i {
  font-size: 1.25rem;
  animation: spin 1s linear infinite;
  color: var(--m-accent);
}

/* 空状态 */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--m-text-secondary);
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.3;
  color: var(--m-accent);
}

/* 通知项 */
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid var(--m-border);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  transition: all var(--m-transition);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--m-bg-tertiary);
}

.notification-item.unread {
  background-color: var(--m-accent-light);
  border-left: 3px solid var(--m-accent);
}

/* 通知图标 */
.notification-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-order {
  background-color: var(--m-success-light);
  color: var(--m-success);
}

.type-message {
  background-color: var(--m-accent-light);
  color: var(--m-accent);
}

.type-system {
  background-color: var(--m-warning-light);
  color: var(--m-warning);
}

/* 通知内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--m-text);
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-message {
  color: var(--m-text-secondary);
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  color: var(--m-text-muted);
  font-size: 0.75rem;
}

/* 通知操作按钮 */
.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: var(--m-text-secondary);
  cursor: pointer;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--m-transition);
}

.action-btn:hover:not(:disabled) {
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.delete-btn:hover {
  color: var(--m-danger);
  background-color: var(--m-danger-light);
}

.read-btn {
  color: var(--m-success);
}

.read-btn:hover {
  background-color: var(--m-success-light);
}

/* 下拉菜单底部 */
.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--m-border);
  text-align: center;
}

.view-all {
  color: var(--m-accent);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--m-transition);
}

.view-all:hover {
  color: var(--m-accent-hover);
  text-decoration: underline;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 滚动条样式 */
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track {
  background: var(--m-bg-tertiary);
}

.notification-list::-webkit-scrollbar-thumb {
  background: var(--m-border);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: var(--m-accent);
}
</style>
    