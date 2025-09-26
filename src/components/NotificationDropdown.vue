<template>
  <div class="notification-container">
    <!-- 通知按钮 -->
    <button 
      class="notification-btn" 
      aria-label="通知"
      @click="toggleDropdown"
      @keydown.enter="toggleDropdown"
    >
      <i class="fa fa-bell"></i>
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
        <div class="loading-state" v-if="isLoading && notifications.length === 0">
          <i class="fa fa-spinner fa-spin"></i>
          <span>加载通知中...</span>
        </div>
        
        <!-- 空状态 -->
        <div class="empty-state" v-if="!isLoading && notifications.length === 0">
          <i class="fa fa-bell-o"></i>
          <p>暂无通知</p>
        </div>
        
        <!-- 通知项 -->
        <div 
          class="notification-item"
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <!-- 通知类型图标 -->
          <div class="notification-icon" :class="getNotificationTypeClass(notification.type)">
            <i :class="getNotificationIcon(notification.type)"></i>
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
              @click.stop="handleDeleteNotification(notification.id)"
              aria-label="删除通知"
            >
              <i class="fa fa-trash-o"></i>
            </button>
            <button 
              class="action-btn read-btn"
              @click.stop="handleMarkAsRead(notification.id)"
              aria-label="标记为已读"
              v-if="!notification.isRead"
            >
              <i class="fa fa-check"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 查看全部链接 -->
      <div class="dropdown-footer" v-if="notifications.length > 0">
        <router-link to="/notifications" class="view-all">查看全部通知</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types/notification';

// 状态
const isOpen = ref(false);
const notifications = ref<Notification[]>([]);
const isLoading = ref(true);
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.isRead).length;
});

// 路由
const router = useRouter();

// 切换下拉菜单
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  
  // 打开时如果有未读通知，自动标记为已读（可选功能）
  // if (isOpen.value && unreadCount.value > 0) {
  //   handleMarkAllAsRead();
  // }
};

// 获取通知图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return 'fa-shopping-cart';
    case 'message':
      return 'fa-comment';
    case 'system':
      return 'fa-info-circle';
    default:
      return 'fa-bell';
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

// 加载通知
const loadNotifications = async () => {
  try {
    isLoading.value = true;
    const data = await notificationService.getNotifications();
    notifications.value = data;
  } catch (error) {
    console.error('加载通知失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 标记通知为已读
const handleMarkAsRead = async (notificationId: string) => {
  try {
    const updatedNotifications = await notificationService.markAsRead(notificationId);
    notifications.value = updatedNotifications;
  } catch (error) {
    console.error('标记通知为已读失败:', error);
  }
};

// 标记所有通知为已读
const handleMarkAllRead = async () => {
  try {
    isLoading.value = true;
    const updatedNotifications = await notificationService.markAllAsRead();
    notifications.value = updatedNotifications;
  } catch (error) {
    console.error('标记所有通知为已读失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 删除通知
const handleDeleteNotification = async (notificationId: string) => {
  try {
    const updatedNotifications = await notificationService.deleteNotification(notificationId);
    notifications.value = updatedNotifications;
  } catch (error) {
    console.error('删除通知失败:', error);
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
    router.push(`/messages/${notification.relatedId}`);
  } else if (notification.type === 'system') {
    router.push('/notifications');
  }
  
  // 关闭下拉菜单
  isOpen.value = false;
};

// 初始化加载通知
onMounted(() => {
  loadNotifications();
  
  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    if (container && !container.contains(e.target as Node)) {
      isOpen.value = false;
    }
  });
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
  color: #9ca3af;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  color: #3b82f6;
  background-color: rgba(55, 65, 81, 0.2);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 通知下拉菜单 */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  max-width: 90vw;
  background-color: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(55, 65, 81, 0.5);
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
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.header-title {
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
}

.mark-all-read {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.mark-all-read:hover {
  background-color: rgba(59, 130, 246, 0.1);
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
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-state i {
  font-size: 1.25rem;
  animation: spin 1s linear infinite;
}

/* 空状态 */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.3;
}

/* 通知项 */
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(55, 65, 81, 0.2);
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.05);
  border-left: 3px solid #3b82f6;
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
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.type-message {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.type-system {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* 通知内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-message {
  color: #9ca3af;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  color: #6b7280;
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
  color: #9ca3af;
  cursor: pointer;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.read-btn {
  color: #10b981;
}

.read-btn:hover {
  background-color: rgba(16, 185, 129, 0.1);
}

/* 下拉菜单底部 */
.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
  text-align: center;
}

.view-all {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all:hover {
  color: #60a5fa;
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
  background: rgba(255, 255, 255, 0.05);
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
    