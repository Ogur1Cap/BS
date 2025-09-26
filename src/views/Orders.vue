<template>
  <div class="orders-page">
    <!-- 头部导航 -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 主内容区域 -->
    <main class="page-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">我的订单</h1>
          <button class="create-order-btn" @click="navigateToCreateOrder">
            <i class="fa fa-plus"></i>
            <span>创建新订单</span>
          </button>
        </div>

        <!-- 筛选和搜索区域 -->
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">订单状态</label>
            <select 
              v-model="statusFilter" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <option value="all">全部状态</option>
              <option value="pending">待接单</option>
              <option value="ongoing">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">游戏类型</label>
            <select 
              v-model="gameFilter" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <option value="all">全部游戏</option>
              <option value="delta">三角洲行动</option>
              <option value="pubg">绝地求生</option>
              <option value="cod">使命召唤</option>
              <option value="apex">Apex英雄</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <select 
              v-model="timeFilter" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">近7天</option>
              <option value="month">近30天</option>
              <option value="quarter">近3个月</option>
            </select>
          </div>
          
          <div class="search-group">
            <div class="search-input-wrapper">
              <i class="fa fa-search search-icon"></i>
              <input
                type="text"
                v-model="searchQuery"
                class="search-input"
                placeholder="搜索订单号或游戏名称"
                @keyup.enter="handleSearch"
              >
              <button 
                class="clear-search"
                @click="clearSearch"
                v-if="searchQuery"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
            <button class="search-btn" @click="handleSearch">
              搜索
            </button>
          </div>
        </div>

        <!-- 订单统计 -->
        <div class="order-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.all }}</span>
            <span class="stat-label">全部订单</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">待接单</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.ongoing }}</span>
            <span class="stat-label">进行中</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">已完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.cancelled }}</span>
            <span class="stat-label">已取消</span>
          </div>
        </div>

        <!-- 订单列表 -->
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th class="order-id-col">订单ID</th>
                <th class="order-game-col">游戏</th>
                <th class="order-service-col">服务类型</th>
                <th class="order-player-col">打手</th>
                <th class="order-status-col">状态</th>
                <th class="order-amount-col">金额</th>
                <th class="order-date-col">创建时间</th>
                <th class="order-action-col">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" class="order-row">
                <td class="order-id-col">{{ order.id }}</td>
                <td class="order-game-col">
                  <div class="game-info">
                    <img :src="order.gameImage" :alt="order.game" class="game-icon">
                    <span>{{ order.game }}</span>
                  </div>
                </td>
                <td class="order-service-col">{{ order.serviceType }}</td>
                <td class="order-player-col">
                  <div class="player-info" v-if="order.player">
                    <img :src="order.player.avatar" :alt="order.player.name" class="player-avatar">
                    <span>{{ order.player.name || '未分配' }}</span>
                  </div>
                  <span class="no-player" v-else>未分配</span>
                </td>
                <td class="order-status-col">
                  <span :class="getOrderStatusClass(order.status)" class="status-badge">{{ order.statusText }}</span>
                </td>
                <td class="order-amount-col">¥{{ order.amount.toFixed(2) }}</td>
                <td class="order-date-col">{{ formatDate(order.createdAt) }}</td>
                <td class="order-action-col">
                  <div class="action-buttons">
                    <router-link 
                      :to="`/orders/${order.id}`" 
                      class="view-btn"
                      title="查看详情"
                    >
                      <i class="fa fa-eye"></i>
                    </router-link>
                    <button 
                      class="cancel-btn"
                      @click="handleCancelOrder(order.id)"
                      title="取消订单"
                      v-if="['pending', 'ongoing'].includes(order.status)"
                    >
                      <i class="fa fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0 && !isLoading">
                <td colspan="8" class="no-orders">
                  <div class="no-orders-content">
                    <i class="fa fa-file-text-o"></i>
                    <p>没有找到符合条件的订单</p>
                    <button class="reset-filters" @click="resetFilters">
                      重置筛选条件
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="isLoading">
                <td colspan="8" class="loading-orders">
                  <div class="loading-content">
                    <i class="fa fa-spinner fa-spin"></i>
                    <p>加载订单中...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页控件 -->
        <div class="pagination" v-if="filteredOrders.length > 0 && !isLoading">
          <button 
            class="page-btn prev-btn"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <i class="fa fa-chevron-left"></i>
            <span>上一页</span>
          </button>
          
          <div class="page-numbers">
            <button 
              class="page-number"
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :class="{ 'active': page === currentPage }"
            >
              {{ page }}
            </button>
            
            <span class="ellipsis" v-if="showFirstEllipsis">...</span>
            
            <button 
              class="page-number last-page"
              @click="changePage(totalPages)"
              v-if="totalPages > 5 && currentPage < totalPages - 2"
            >
              {{ totalPages }}
            </button>
          </div>
          
          <button 
            class="page-btn next-btn"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            <span>下一页</span>
            <i class="fa fa-chevron-right"></i>
          </button>
          
          <div class="page-info">
            共 {{ totalOrders }} 条，当前 {{ currentPage }}/{{ totalPages }} 页
          </div>
        </div>
      </div>
    </main>

    <!-- 操作结果提示 -->
    <div v-if="showToast" class="toast" :class="toastType">
      <i :class="toastIcon"></i>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- 确认取消订单弹窗 -->
    <div class="modal-backdrop" v-if="showCancelModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">取消订单</h3>
          <button class="close-modal" @click="showCancelModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>您确定要取消订单 <strong>{{ cancelOrderId }}</strong> 吗？</p>
          <p class="cancel-warning">取消订单可能会影响您的信誉评级，部分情况下可能无法全额退款。</p>
          <textarea
            v-model="cancelReason"
            class="cancel-reason"
            placeholder="请输入取消原因（选填）"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showCancelModal = false">
            取消
          </button>
          <button class="modal-btn confirm" @click="confirmCancelOrder">
            确认取消
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';

// 路由实例
const router = useRouter();

// 状态管理
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200');
const isLoading = ref(true);
const orders = ref<any[]>([]);

// 筛选和搜索状态
const statusFilter = ref('all');
const gameFilter = ref('all');
const timeFilter = ref('all');
const searchQuery = ref('');

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);

// 弹窗状态
const showCancelModal = ref(false);
const cancelOrderId = ref('');
const cancelReason = ref('');

// 提示消息状态
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// 初始化订单数据
const initOrders = () => {
  // 模拟订单数据
  const mockOrders = [
    {
      id: 'ORD-87621',
      game: '三角洲行动',
      gameKey: 'delta',
      gameImage: 'https://picsum.photos/id/237/60/60',
      serviceType: '全程护航',
      status: 'completed',
      statusText: '已完成',
      amount: 198,
      createdAt: '2023-10-15T14:30:00',
      player: {
        id: 'player-101',
        name: '精英玩家007',
        avatar: 'https://picsum.photos/id/1012/40/40'
      }
    },
    {
      id: 'ORD-87542',
      game: '绝地求生',
      gameKey: 'pubg',
      gameImage: 'https://picsum.photos/id/238/60/60',
      serviceType: '段位提升',
      status: 'ongoing',
      statusText: '进行中',
      amount: 298,
      createdAt: '2023-10-16T09:15:00',
      player: {
        id: 'player-108',
        name: '战神小菜鸡',
        avatar: 'https://picsum.photos/id/1025/40/40'
      }
    },
    {
      id: 'ORD-87459',
      game: '使命召唤',
      gameKey: 'cod',
      gameImage: 'https://picsum.photos/id/239/60/60',
      serviceType: '任务代练',
      status: 'completed',
      statusText: '已完成',
      amount: 158,
      createdAt: '2023-10-12T19:45:00',
      player: {
        id: 'player-096',
        name: 'COD大神',
        avatar: 'https://picsum.photos/id/1074/40/40'
      }
    },
    {
      id: 'ORD-87345',
      game: 'Apex英雄',
      gameKey: 'apex',
      gameImage: 'https://picsum.photos/id/240/60/60',
      serviceType: '武器解锁',
      status: 'pending',
      statusText: '待接单',
      amount: 128,
      createdAt: '2023-10-17T11:30:00',
      player: null
    },
    {
      id: 'ORD-87215',
      game: '三角洲行动',
      gameKey: 'delta',
      gameImage: 'https://picsum.photos/id/237/60/60',
      serviceType: '装备代刷',
      status: 'cancelled',
      statusText: '已取消',
      amount: 98,
      createdAt: '2023-10-10T08:45:00',
      player: null
    },
    {
      id: 'ORD-87165',
      game: '绝地求生',
      gameKey: 'pubg',
      gameImage: 'https://picsum.photos/id/238/60/60',
      serviceType: '全程护航',
      status: 'completed',
      statusText: '已完成',
      amount: 258,
      createdAt: '2023-10-05T16:20:00',
      player: {
        id: 'player-108',
        name: '战神小菜鸡',
        avatar: 'https://picsum.photos/id/1025/40/40'
      }
    },
    {
      id: 'ORD-87052',
      game: '使命召唤',
      gameKey: 'cod',
      gameImage: 'https://picsum.photos/id/239/60/60',
      serviceType: '段位提升',
      status: 'completed',
      statusText: '已完成',
      amount: 328,
      createdAt: '2023-09-28T15:10:00',
      player: {
        id: 'player-096',
        name: 'COD大神',
        avatar: 'https://picsum.photos/id/1074/40/40'
      }
    },
    {
      id: 'ORD-86987',
      game: '三角洲行动',
      gameKey: 'delta',
      gameImage: 'https://picsum.photos/id/237/60/60',
      serviceType: '全程护航',
      status: 'ongoing',
      statusText: '进行中',
      amount: 198,
      createdAt: '2023-10-17T10:05:00',
      player: {
        id: 'player-101',
        name: '精英玩家007',
        avatar: 'https://picsum.photos/id/1012/40/40'
      }
    }
  ];

  orders.value = mockOrders;
  isLoading.value = false;
};

// 获取当前用户信息
const initUserInfo = () => {
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    const userData = JSON.parse(userStr);
    currentUser.value = userData;
    userAvatar.value = userData.avatar || 'https://picsum.photos/id/237/200/200';
  } else {
    router.push('/login');
  }
};

// 筛选订单
const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(order => order.status === statusFilter.value);
  }
  
  // 游戏筛选
  if (gameFilter.value !== 'all') {
    result = result.filter(order => order.gameKey === gameFilter.value);
  }
  
  // 时间筛选
  if (timeFilter.value !== 'all') {
    const now = new Date();
    let timeThreshold = new Date();
    
    switch (timeFilter.value) {
      case 'today':
        timeThreshold.setHours(0, 0, 0, 0);
        break;
      case 'week':
        timeThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeThreshold.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        timeThreshold.setMonth(now.getMonth() - 3);
        break;
    }
    
    result = result.filter(order => new Date(order.createdAt) >= timeThreshold);
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      order => order.id.toLowerCase().includes(query) || 
               order.game.toLowerCase().includes(query)
    );
  }
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

// 订单总数
const totalOrders = computed(() => {
  // 计算符合筛选条件的订单总数（不包含分页）
  let result = [...orders.value];
  
  if (statusFilter.value !== 'all') {
    result = result.filter(order => order.status === statusFilter.value);
  }
  
  if (gameFilter.value !== 'all') {
    result = result.filter(order => order.gameKey === gameFilter.value);
  }
  
  if (timeFilter.value !== 'all') {
    const now = new Date();
    let timeThreshold = new Date();
    
    switch (timeFilter.value) {
      case 'today':
        timeThreshold.setHours(0, 0, 0, 0);
        break;
      case 'week':
        timeThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeThreshold.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        timeThreshold.setMonth(now.getMonth() - 3);
        break;
    }
    
    result = result.filter(order => new Date(order.createdAt) >= timeThreshold);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      order => order.id.toLowerCase().includes(query) || 
               order.game.toLowerCase().includes(query)
    );
  }
  
  return result.length;
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(totalOrders.value / pageSize.value);
});

// 可见页码（最多显示5个）
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  
  // 总页数小于等于5时，显示所有页码
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  // 总页数大于5时，根据当前页显示附近的页码
  if (currentPage.value <= 3) {
    return [1, 2, 3, 4, 5];
  }
  
  if (currentPage.value >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }
  
  return [
    currentPage.value - 2,
    currentPage.value - 1,
    currentPage.value,
    currentPage.value + 1,
    currentPage.value + 2
  ];
});

// 是否显示前面的省略号
const showFirstEllipsis = computed(() => {
  return totalPages.value > 5 && currentPage.value > 3;
});

// 订单统计数据
const stats = computed(() => {
  return {
    all: orders.value.length,
    pending: orders.value.filter(order => order.status === 'pending').length,
    ongoing: orders.value.filter(order => order.status === 'ongoing').length,
    completed: orders.value.filter(order => order.status === 'completed').length,
    cancelled: orders.value.filter(order => order.status === 'cancelled').length
  };
});

// 获取订单状态样式
const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'ongoing':
      return 'status-ongoing';
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-default';
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 处理筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1; // 筛选条件变化时重置到第一页
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

// 重置筛选条件
const resetFilters = () => {
  statusFilter.value = 'all';
  gameFilter.value = 'all';
  timeFilter.value = 'all';
  searchQuery.value = '';
  currentPage.value = 1;
};

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  
  // 滚动到表格顶部
  const tableContainer = document.querySelector('.orders-table-container');
  if (tableContainer) {
    tableContainer.scrollIntoView({ behavior: 'smooth' });
  }
};

// 导航到创建订单页面
const navigateToCreateOrder = () => {
  router.push('/escort');
};

// 处理取消订单
const handleCancelOrder = (orderId: string) => {
  cancelOrderId.value = orderId;
  cancelReason.value = '';
  showCancelModal.value = true;
};

// 确认取消订单
const confirmCancelOrder = async () => {
  if (!cancelOrderId.value) return;
  
  try {
    isLoading.value = true;
    showCancelModal.value = false;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新订单状态
    const orderIndex = orders.value.findIndex(order => order.id === cancelOrderId.value);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled';
      orders.value[orderIndex].statusText = '已取消';
    }
    
    // 显示成功提示
    showToastMessage('订单已成功取消', 'success');
  } catch (error) {
    console.error('取消订单失败:', error);
    showToastMessage('取消订单失败，请稍后重试', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 显示提示消息
const showToastMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};

// 页面加载时初始化
onMounted(() => {
  initUserInfo();
  initOrders();
});
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background-color: #111827;
  color: #f3f4f6;
}

.page-content {
  padding: 2rem 0 4rem;
}

.container {
  width: 100%;
  max-width: 1400px;
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

.create-order-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-order-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.create-order-btn i {
  font-size: 1rem;
}

/* 筛选和搜索区域 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  color: #9ca3af;
  font-size: 0.875rem;
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  padding-right: 2.5rem;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  color: #f3f4f6;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.search-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.5rem 1rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  color: #f3f4f6;
  font-size: 0.875rem;
  width: 280px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.search-input::placeholder {
  color: #6b7280;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background-color: rgba(55, 65, 81, 0.3);
  color: #f3f4f6;
}

.search-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.search-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 订单统计 */
.order-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  flex: 1;
  min-width: 120px;
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 订单表格 */
.orders-table-container {
  overflow-x: auto;
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  margin-bottom: 1.5rem;
}

.orders-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: left;
}

.orders-table th {
  background-color: rgba(17, 24, 37, 0.7);
  color: #d1d5db;
  font-weight: 600;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.orders-table th:first-child {
  border-radius: 1rem 0 0 0;
}

.orders-table th:last-child {
  border-radius: 0 1rem 0 0;
}

.order-row {
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  transition: background-color 0.2s ease;
}

.order-row:hover {
  background-color: rgba(55, 65, 81, 0.1);
}

.order-row:last-child {
  border-bottom: none;
}

/* 表格列样式 */
.order-id-col {
  font-family: monospace;
  color: #9ca3af;
  width: 120px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.no-player {
  color: #9ca3af;
  font-style: italic;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-ongoing {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.order-amount-col {
  font-weight: 600;
  color: #3b82f6;
}

.order-date-col {
  color: #9ca3af;
  width: 140px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.cancel-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.view-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.cancel-btn {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.cancel-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

/* 无订单状态 */
.no-orders {
  padding: 4rem 2rem;
  text-align: center;
}

.no-orders-content {
  max-width: 300px;
  margin: 0 auto;
}

.no-orders-content i {
  font-size: 3rem;
  color: #374151;
  margin-bottom: 1rem;
}

.no-orders-content p {
  color: #9ca3af;
  margin-bottom: 1.5rem;
}

.reset-filters {
  padding: 0.5rem 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 加载状态 */
.loading-orders {
  padding: 4rem 2rem;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-content i {
  font-size: 2rem;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.loading-content p {
  color: #9ca3af;
}

/* 分页控件 */
.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  color: #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  background-color: rgba(55, 65, 81, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  color: #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.page-number:hover:not(.active) {
  background-color: rgba(55, 65, 81, 0.3);
}

.page-number.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
  font-weight: 600;
}

.ellipsis {
  color: #6b7280;
  padding: 0 0.5rem;
}

.page-info {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-left: 1rem;
}

/* 提示消息 */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  animation: fadeInUp 0.3s ease forwards;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background-color: #10b981;
}

.toast.error {
  background-color: #ef4444;
}

.toast i {
  font-size: 1.25rem;
}

/* 确认弹窗 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background-color: #1f2937;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(55, 65, 81, 0.5);
  animation: scaleIn 0.3s ease;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #f3f4f6;
}

.close-modal {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background-color: rgba(55, 65, 81, 0.3);
  color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #d1d5db;
}

.cancel-warning {
  color: #f59e0b;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.cancel-reason {
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(17, 24, 37, 0.5);
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: #f3f4f6;
  font-family: inherit;
  resize: vertical;
}

.cancel-reason:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.modal-btn.cancel {
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
}

.modal-btn.cancel:hover {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

.modal-btn.confirm {
  background-color: #ef4444;
  color: white;
}

.modal-btn.confirm:hover {
  background-color: #dc2626;
}

/* 动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group {
    margin-left: 0;
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .page-info {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
    text-align: center;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
    