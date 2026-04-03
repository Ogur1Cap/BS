<template>
  <div class="notifications-page">
    <!-- 头部导航 -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 主内容区域 -->
    <main class="page-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">通知中心</h1>
          <div class="header-actions">
            <button 
              class="mark-all-read-btn"
              @click="handleMarkAllRead"
              :disabled="isLoading || unreadCount === 0"
            >
              <i class="fa fa-check" v-if="!isLoading"></i>
              <i class="fa fa-spinner fa-spin" v-if="isLoading"></i>
              <span>全部标为已读</span>
            </button>
            <button 
              class="delete-all-btn"
              type="button"
              @click="handleDeleteAll"
              :disabled="isLoading || clearingAll || notifications.length === 0"
            >
              <i class="fa" :class="clearingAll ? 'fa-spinner fa-spin' : 'fa-trash-o'"></i>
              <span>{{ clearingAll ? '清空中…' : '清空通知' }}</span>
            </button>
          </div>
        </div>
        
        <!-- 通知过滤器 -->
        <div class="notification-filters">
          <button 
            class="filter-btn"
            :class="{ 'active': activeFilter === 'all' }"
            @click="activeFilter = 'all'"
          >
            全部通知
          </button>
          <button 
            class="filter-btn"
            :class="{ 'active': activeFilter === 'unread' }"
            @click="activeFilter = 'unread'"
          >
            未读通知
            <span class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </button>
          <button 
            class="filter-btn"
            :class="{ 'active': activeFilter === 'order' }"
            @click="activeFilter = 'order'"
          >
            订单通知
          </button>
          <button 
            class="filter-btn"
            :class="{ 'active': activeFilter === 'message' }"
            @click="activeFilter = 'message'"
          >
            消息通知
          </button>
          <button 
            class="filter-btn"
            :class="{ 'active': activeFilter === 'system' }"
            @click="activeFilter = 'system'"
          >
            系统通知
          </button>
        </div>
        
        <!-- 通知列表 -->
        <div class="notifications-list">
          <!-- 加载状态 -->
          <div class="loading-state" v-if="isLoading && notifications.length === 0">
            <i class="fa fa-spinner fa-spin"></i>
            <span>加载通知中...</span>
          </div>
          
          <!-- 空状态 -->
          <div class="empty-state" v-if="!isLoading && filteredNotifications.length === 0">
            <i class="fa fa-bell-o"></i>
            <p>暂无通知</p>
          </div>
          
          <!-- 通知项 -->
          <div 
            class="notification-item"
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="{ 'unread': !notification.isRead }"
          >
            <!-- 通知类型图标 -->
            <div class="notification-icon" :class="getNotificationTypeClass(notification.type)">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            
            <!-- 通知内容 -->
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.content }}</p>
              <div class="notification-meta">
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                <div class="notification-actions">
                  <button 
                    class="action-btn read-btn"
                    type="button"
                    :disabled="clearingAll || deletingId === notification.id"
                    @click="handleMarkAsRead(notification.id)"
                    v-if="!notification.isRead"
                  >
                    <i class="fa fa-check"></i> 标为已读
                  </button>
                  <button 
                    class="action-btn delete-btn"
                    type="button"
                    :disabled="deletingId === notification.id || clearingAll"
                    @click="handleDeleteNotification(notification.id)"
                  >
                    <i
                      class="fa"
                      :class="deletingId === notification.id ? 'fa-spinner fa-spin' : 'fa-trash-o'"
                    ></i>
                    {{ deletingId === notification.id ? '删除中…' : '删除' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <Footer />

    <!-- 操作结果轻提示 -->
    <Transition name="toast-fade">
      <div v-if="toastVisible" class="notif-toast" :class="'notif-toast--' + toastType" role="status">
        <i class="fa" :class="toastType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../stores/notifications';
import { notificationsApi } from '../api/notificationsApi';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';

// 路由实例
const router = useRouter();
const notificationStore = useNotificationStore();
const { items: notifications } = storeToRefs(notificationStore);

// 状态
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200');
const isLoading = ref(true);
const activeFilter = ref('all');
/** 单条删除中（防重复点击） */
const deletingId = ref<string | null>(null);
/** 批量清空进行中 */
const clearingAll = ref(false);
const toastVisible = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

function showToast(message: string, type: 'success' | 'error') {
  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;
  window.setTimeout(() => {
    toastVisible.value = false;
  }, 2800);
}

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter((notification) => !notification.isRead).length;
});

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value;
  } else if (activeFilter.value === 'unread') {
    return notifications.value.filter((notification) => !notification.isRead);
  } else {
    return notifications.value.filter((notification) => notification.type === activeFilter.value);
  }
});

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
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 加载通知（写入全局 store，顶栏角标同步）
const loadNotifications = async () => {
  try {
    isLoading.value = true;
    await notificationStore.refreshList();
  } catch (error) {
    console.error('加载通知失败:', error);
  } finally {
    isLoading.value = false;
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

// 删除通知（二次确认 + 加载态 + 结果提示）
const handleDeleteNotification = async (notificationId: string) => {
  if (!window.confirm('确定删除这条通知？删除后无法恢复。')) return;
  if (deletingId.value) return;
  deletingId.value = notificationId;
  try {
    const list = await notificationsApi.deleteNotification(notificationId);
    notificationStore.applyListFromApi(list);
    void notificationStore.refreshUnreadCount().catch(() => {});
    showToast('通知已删除', 'success');
  } catch (error) {
    console.error('删除通知失败:', error);
    showToast('删除失败，请稍后重试', 'error');
  } finally {
    deletingId.value = null;
  }
};

// 清空当前账号可见的全部通知
const handleDeleteAll = async () => {
  if (!window.confirm('确定清空全部通知？删除后无法恢复。')) return;
  const ids = notificationStore.items.map((n) => n.id);
  if (ids.length === 0) return;
  clearingAll.value = true;
  try {
    for (const id of ids) {
      const list = await notificationsApi.deleteNotification(id);
      notificationStore.applyListFromApi(list);
    }
    void notificationStore.refreshUnreadCount().catch(() => {});
    showToast('已清空全部通知', 'success');
  } catch (error) {
    console.error('清空通知失败:', error);
    showToast('清空失败，请稍后重试', 'error');
  } finally {
    clearingAll.value = false;
  }
};

// 处理登出
const handleLogout = () => {
  // 清除存储的登录信息
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  
  // 跳转到登录页
  router.push('/login');
};

// 初始化
onMounted(() => {
  // 获取用户信息
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    router.push('/login');
    return;
  }
  
  // 加载通知
  loadNotifications();
});
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background-color: #111827;
  color: #f3f4f6;
}

.page-content {
  padding: 2rem 0 4rem;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #f3f4f6;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.mark-all-read-btn,
.delete-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.mark-all-read-btn {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.mark-all-read-btn:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-all-btn {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-all-btn:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.2);
}

.delete-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 通知过滤器 */
.notification-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  background-color: rgba(55, 65, 81, 0.3);
  color: #f3f4f6;
}

.filter-btn.active {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}

.unread-badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 通知列表 */
.notifications-list {
  border-radius: 1rem;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  overflow: hidden;
}

/* 加载状态 */
.loading-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-state i {
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
}

/* 空状态 */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

/* 通知项 */
.notification-item {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: background-color 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(55, 65, 81, 0.1);
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.05);
  border-left: 4px solid #3b82f6;
}

/* 通知图标 */
.notification-icon {
  width: 3rem;
  height: 3rem;
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
}

.notification-title {
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.notification-message {
  color: #9ca3af;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-time {
  color: #6b7280;
  font-size: 0.875rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.read-btn {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.read-btn:hover {
  background-color: rgba(16, 185, 129, 0.2);
}

.delete-btn {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.delete-btn:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.2);
}

.action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 底部轻提示 */
.notif-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
}

.notif-toast--success {
  background: #064e3b;
  color: #d1fae5;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.notif-toast--error {
  background: #7f1d1d;
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* 动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 滚动条样式 */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
    