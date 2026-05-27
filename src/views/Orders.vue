<template>
  <!--
  【订单管理页面】核心业务页面 - 订单全生命周期管理
  功能：订单列表展示、多维度筛选（状态/游戏/时间）、搜索、分页、创建订单、取消订单、申请退款
  交互：
    - 筛选栏联动过滤 → 实时更新统计数据
    - 点击"创建新订单" → 弹窗选择游戏/服务/打手 → 栗币支付
    - 点击"取消订单" → 确认弹窗 → 提交取消
    - 点击"申请退款" → 选择原因 → 提交退款申请给Boss审核
  角色：所有登录用户可见（顾客查看自己的订单）
  -->
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
          <button v-if="isCustomerAccount()" class="create-order-btn" @click="navigateToCreateOrder">
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
              <option value="completion_pending">待审核完成</option>
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
              <option v-for="game in gameOptions" :key="game.key" :value="game.key">{{ game.name }}</option>
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
                v-model="rawSearch"
                class="search-input"
                placeholder="搜索订单号或游戏名称"
                @keyup.enter="handleSearch"
              >
              <button 
                class="clear-search"
                @click="clearSearch"
                v-if="rawSearch"
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
                <td class="order-id-col">
                  <span class="order-id-text">{{ order.id }}</span>
                  <button
                    class="copy-id-btn"
                    :title="copiedOrderId === order.id ? '已复制' : '复制订单号'"
                    @click="copyOrderId(order.id)"
                  >
                    <i :class="copiedOrderId === order.id ? 'fa fa-check' : 'far fa-copy'"></i>
                  </button>
                </td>
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
                    <button 
                      class="view-btn"
                      title="查看详情"
                      @click="handleViewOrder(order.id)"
                    >
                      <i class="fa fa-eye"></i>
                      <span>查看详情</span>
                    </button>
                    <button 
                      class="cancel-btn"
                      @click="handleCancelOrder(order.id)"
                      title="取消订单"
                      v-if="['pending', 'ongoing', 'completion_pending'].includes(order.status)"
                    >
                      <i class="fa fa-times"></i>
                      <span>取消订单</span>
                    </button>
                    <button 
                      class="refund-btn"
                      @click="handleRefundOrder(order.id)"
                      title="申请退款"
                      v-if="['completed'].includes(order.status)"
                    >
                      <i class="fa fa-refresh"></i>
                      <span>申请退款</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0 && !isLoading">
                <td colspan="8" class="no-orders">
                  <div class="no-orders-content">
                    <i class="far fa-file-lines"></i>
                    <p>没有找到符合条件的订单</p>
                    <button class="reset-filters" @click="resetFilters">
                      重置筛选条件
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="isLoading">
                <td colspan="8" class="skeleton-cell-wrap">
                  <SkeletonTable :rows="5" />
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

    <!-- 创建订单弹窗（优化布局：游戏预览 + 服务快捷选择 + 金额预设） -->
    <div class="modal-backdrop co-backdrop" v-if="showCreateModal" @click.self="closeCreateModal">
      <div class="modal co-modal">
        <div class="modal-header">
          <h3 id="co-title" class="modal-title">创建订单</h3>
          <button type="button" class="close-modal" aria-label="关闭" @click="closeCreateModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body co-body">
          <div class="co-layout">
            <aside class="co-aside">
              <div class="co-game-card">
                <img :src="selectedCreateGame.image" alt="" class="co-game-img" />
                <p class="co-game-name">{{ selectedCreateGame.name }}</p>
                <label class="co-mini-label">切换游戏</label>
                <select v-model="createForm.gameKey" class="filter-select co-game-select">
                  <option v-for="game in gameOptions" :key="game.key" :value="game.key">{{ game.name }}</option>
                </select>
              </div>
              <router-link to="/play-hall" class="co-hall-link" @click="closeCreateModal">
                <i class="fa fa-users"></i> 去打手大厅选择打手
              </router-link>
            </aside>
            <div class="co-main-fields">
              <p class="co-hint">请选择服务类型；金额可点快捷金额或自定义。</p>
              <label class="co-field-label">服务类型</label>
              <div class="co-chips">
                <button
                  v-for="s in SERVICE_LIST"
                  :key="s.key"
                  type="button"
                  class="co-chip"
                  :class="{ active: createForm.serviceType === s.name }"
                  @click="pickCreateService(s)"
                >
                  {{ s.name }}
                  <span class="co-chip-sub">¥{{ s.defaultAmount }}起</span>
                </button>
              </div>
              <label class="co-field-label">订单金额（元）</label>
              <div class="co-amount-row">
                <button
                  v-for="amt in createAmountPresets"
                  :key="amt"
                  type="button"
                  class="co-amt-pill"
                  :class="{ active: createForm.amount === amt }"
                  @click="createForm.amount = amt"
                >
                  ¥{{ amt }}
                </button>
                <input
                  v-model.number="createForm.amount"
                  class="search-input co-amount-input"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="自定义"
                />
              </div>
              <label class="co-field-label">指定打手（可选）</label>
              <div class="co-player-row">
                <input
                  v-model.trim="createForm.playerId"
                  class="search-input"
                  type="text"
                  placeholder="打手档案 ID（大厅卡片上可见）"
                />
                <input
                  v-model.trim="createForm.playerName"
                  class="search-input"
                  type="text"
                  placeholder="打手昵称"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="order-coin-balance" v-if="orderCoinBalance > 0">
          <i class="fa fa-coins"></i>
          <span>栗币余额：<strong>{{ formatCoin(orderCoinBalance) }}</strong></span>
          <span class="coin-sep">|</span>
          <span>需支付：<strong>{{ orderCoinCost }}</strong> 栗币</span>
          <span v-if="orderCoinBalance < orderCoinCost" class="coin-warn"><i class="fa fa-exclamation-triangle"></i> 余额不足 <router-link to="/wallet" class="coin-recharge-link">去充值 →</router-link></span>
          <span v-else class="coin-ok"><i class="fa fa-check-circle"></i> 余额充足</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="modal-btn cancel" :disabled="createSubmitting" @click="closeCreateModal">取消</button>
          <button type="button" class="modal-btn confirm" :disabled="createSubmitting" @click="submitCreateOrder">
            <span v-if="createSubmitting"><i class="fa fa-spinner fa-spin"></i> 提交中…</span>
            <span v-else>确认创建</span>
          </button>
        </div>
      </div>
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

    <!-- 申请退款弹窗 -->
    <div class="modal-backdrop" v-if="showRefundModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">申请退款</h3>
          <button class="close-modal" @click="showRefundModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>您确定要为订单 <strong>{{ refundOrderId }}</strong> 申请退款吗？</p>
          <p class="cancel-warning">退款申请将提交给管理员审核，审核通过后将按照相关规定处理。</p>
          
          <div class="refund-amount">
            <label class="refund-amount-label">退款金额</label>
            <div class="refund-amount-value">¥{{ refundAmount.toFixed(2) }}</div>
          </div>
          
          <div class="refund-reason">
            <label class="refund-reason-label">退款原因</label>
            <select v-model="refundReason" class="refund-reason-select">
              <option value="">请选择退款原因</option>
              <option v-for="option in refundReasonOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          
          <textarea
            v-model="refundDescription"
            class="cancel-reason"
            placeholder="请详细描述退款原因（选填）"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showRefundModal = false">
            取消
          </button>
          <button class="modal-btn confirm refund-confirm" @click="confirmRefundOrder">
            提交退款申请
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
/*
 * 订单管理 - 核心业务逻辑
 * 功能模块：
 *   1. 订单列表 - 筛选、搜索、分页
 *   2. 创建订单 - 弹窗表单（游戏选择/服务类型/金额/打手指定）→ 栗币扣款
 *   3. 取消订单 - 确认弹窗 → 取消并通知
 *   4. 退款申请 - 原因选择 → 提交Boss审核
 *   5. 订单状态流转：pending(待接单) → ongoing(进行中) → completion_pending(待审核) → completed(已完成)
 */
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ordersApi } from '../api/ordersApi';
import { GAME_LIST, getGameByKey } from '../constants/games';
import { SERVICE_LIST, getServiceByKey } from '../constants/services';
import type { ServiceMeta } from '../constants/services';
import { isCustomerAccount } from '../utils/authLevel';
import { normalizePlayerProfileId } from '../utils/playerProfileId';
import { useDebounce } from '../composables/useDebounce';
import { useClipboard } from '../composables/useClipboard';
import { useEscKey } from '../composables/useEscKey';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import SkeletonTable from '../components/Common/SkeletonTable.vue';

// 路由实例
const router = useRouter();
const route = useRoute();

// 状态管理
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200');
const isLoading = ref(true);
const orders = ref<any[]>([]);

// ========== 筛选和搜索状态 ==========
const statusFilter = ref('all');
const gameFilter = ref('all');
const timeFilter = ref('all');
const rawSearch = ref('');
const { debounced: searchQuery } = useDebounce(rawSearch, 350);

const { copy, copied: copyId } = useClipboard();
const copiedOrderId = ref('');

// ========== 分页状态 ==========
const currentPage = ref(1);
const pageSize = ref(10);

// ========== 弹窗状态 ==========
const showCancelModal = ref(false);
const cancelOrderId = ref('');
const cancelReason = ref('');
const showRefundModal = ref(false);
const refundOrderId = ref('');
const refundReason = ref('');
const refundDescription = ref('');
const refundAmount = ref(0);
const refundReasonOptions = [
  '服务质量问题',
  '未按时完成',
  '与描述不符',
  '个人原因',
  '其他'
];
const showCreateModal = ref(false);
const createSubmitting = ref(false);

// ESC 键关闭弹窗
useEscKey(showCancelModal, () => { showCancelModal.value = false });
useEscKey(showRefundModal, () => { showRefundModal.value = false });
useEscKey(showCreateModal, () => { closeCreateModal() });
const orderCoinBalance = ref(0);
const orderCoinCost = computed(() => createForm.amount)
function formatCoin(val: number): string {
  return (val / 100).toLocaleString('zh-CN') + ' 🪙'
}
/** 创建订单金额快捷按钮 */
const createAmountPresets = [128, 158, 198, 248, 298];

// 创建订单表单
const gameOptions = GAME_LIST.map((game) => ({
  key: game.key,
  name: game.name,
  image: game.imageUrl.replace('/400/200', '/60/60')
}));
const serviceOptions = SERVICE_LIST.map((service) => service.name);

const createForm = reactive({
  gameKey: 'delta',
  serviceType: '全程护航',
  amount: 198,
  playerId: '',
  playerName: ''
});

const selectedCreateGame = computed(() => {
  return gameOptions.find((item) => item.key === createForm.gameKey) || gameOptions[0];
});

// 提示消息状态
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');
const toastIcon = computed(() => (toastType.value === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'));

// 初始化订单数据（来自 API / mock store）
const initOrders = async () => {
  try {
    isLoading.value = true;
    orders.value = await ordersApi.listOrders();
  } finally {
    isLoading.value = false;
  }
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

// 【核心功能】多条件筛选 + 搜索 + 分页
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
    case 'completion_pending':
      return 'status-completion-pending';
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
  currentPage.value = 1;
};

watch(searchQuery, () => {
  currentPage.value = 1;
});

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 清除搜索
const clearSearch = () => {
  rawSearch.value = '';
};

// 重置筛选条件
const resetFilters = () => {
  statusFilter.value = 'all';
  gameFilter.value = 'all';
  timeFilter.value = 'all';
  rawSearch.value = '';
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

// 查看订单详情
const handleViewOrder = (orderId: string) => {
  router.push(`/orders/${orderId}`);
};

const copyOrderId = async (orderId: string) => {
  const ok = await copy(orderId)
  if (ok) {
    copiedOrderId.value = orderId
    setTimeout(() => { copiedOrderId.value = '' }, 2200)
  }
};

// 导航到创建订单页面
const navigateToCreateOrder = async () => {
  showCreateModal.value = true;
  try {
    const { useWalletStore } = await import('../stores/wallet')
    const ws = useWalletStore()
    await ws.ensureLoaded()
    orderCoinBalance.value = ws.balance
  } catch {
    orderCoinBalance.value = 0
  }
};

function closeCreateModal() {
  showCreateModal.value = false;
}

/** 点击服务类型 chip：同步推荐金额 */
function pickCreateService(s: ServiceMeta) {
  createForm.serviceType = s.name;
  createForm.amount = s.defaultAmount;
}

// 【核心交互】创建订单：表单验证 → 栗币余额检查 → 调用ordersApi.createOrder() → 刷新列表
const submitCreateOrder = async () => {
  if (!createForm.serviceType || createForm.amount <= 0) {
    showToastMessage('请完善订单信息后再提交', 'error');
    return;
  }

  const amountYuan = Number(createForm.amount) || 198
  const costInCents = Math.round(amountYuan * 100)

  if (orderCoinBalance.value > 0 && orderCoinBalance.value < costInCents) {
    showToastMessage('栗币余额不足，请先充值', 'error')
    return
  }

  try {
    createSubmitting.value = true;
    isLoading.value = true;
    const selectedService = getServiceByNameSafe(createForm.serviceType);
    const payload = {
      gameKey: selectedCreateGame.value.key,
      game: selectedCreateGame.value.name,
      gameImage: selectedCreateGame.value.image,
      serviceType: createForm.serviceType,
      amount: amountYuan,
      playerId: (() => {
        const n = normalizePlayerProfileId(createForm.playerId);
        return n || undefined;
      })(),
      playerName: createForm.playerName.trim() || undefined
    };
    orders.value = await ordersApi.createOrder(payload);
    closeCreateModal();
    showToastMessage('订单创建成功，已扣除相应栗币', 'success');
    currentPage.value = 1;
    const { useWalletStore } = await import('../stores/wallet')
    await useWalletStore().refresh()
  } catch (error: unknown) {
    console.error('创建订单失败:', error);
    const msg = error instanceof Error ? error.message : '创建订单失败，请稍后重试'
    showToastMessage(msg, 'error');
    if (msg.includes('余额不足')) {
      showToastMessage('栗币余额不足，请先充值', 'error')
    }
  } finally {
    createSubmitting.value = false;
    isLoading.value = false;
  }
};

const applyCreateQuery = () => {
  const shouldCreate = String(route.query.create || '') === '1';
  if (!shouldCreate) return;
  const gameKey = String(route.query.gameKey || '').trim();
  const serviceKey = String(route.query.serviceKey || '').trim();
  const playerId = String(route.query.playerId || '').trim();
  const playerName = String(route.query.playerName || '').trim();
  const validGame = !!getGameByKey(gameKey);
  const serviceMeta = getServiceByKey(serviceKey);
  if (validGame) createForm.gameKey = gameKey;
  if (serviceMeta) {
    createForm.serviceType = serviceMeta.name;
    createForm.amount = serviceMeta.defaultAmount;
  }
  if (playerId) {
    createForm.playerId = playerId;
    createForm.playerName = playerName || `打手-${playerId}`;
  }
  showCreateModal.value = true;
  router.replace({ path: '/orders' });
};

const getServiceByNameSafe = (serviceName: string) => {
  return SERVICE_LIST.find((service) => service.name === serviceName);
};

// 处理取消订单 - 打开确认弹窗
const handleCancelOrder = (orderId: string) => {
  cancelOrderId.value = orderId;
  cancelReason.value = '';
  showCancelModal.value = true;
};

// 处理申请退款 - 打开退款理由弹窗
const handleRefundOrder = (orderId: string) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    refundOrderId.value = orderId;
    refundReason.value = '';
    refundAmount.value = order.amount;
    showRefundModal.value = true;
  }
};

// 【核心交互】确认取消订单 → 调用API → 刷新订单列表
const confirmCancelOrder = async () => {
  if (!cancelOrderId.value) return;
  
  try {
    isLoading.value = true;
    showCancelModal.value = false;

    const updatedOrders = await ordersApi.cancelOrder(cancelOrderId.value);
    orders.value = updatedOrders;

    showToastMessage('订单已成功取消', 'success');
  } catch (error) {
    console.error('取消订单失败:', error);
    showToastMessage('取消订单失败，请稍后重试', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 【核心交互】确认退款申请 → 调用API → Boss后台审核
const confirmRefundOrder = async () => {
  if (!refundOrderId.value) return;
  
  try {
    isLoading.value = true;
    showRefundModal.value = false;

    const updatedOrders = await ordersApi.refundOrder({ 
      orderId: refundOrderId.value, 
      reason: refundReason.value || '用户申请退款' 
    });
    orders.value = updatedOrders;

    showToastMessage('退款申请已提交，等待处理', 'success');
  } catch (error) {
    console.error('申请退款失败:', error);
    showToastMessage('申请退款失败，请稍后重试', 'error');
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
  applyCreateQuery();
});
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
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
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--m-text);
  letter-spacing: -0.01em;
}

.create-order-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.create-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}

.create-order-btn i {
  font-size: 0.85rem;
}

/* 筛选和搜索区域 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
  padding: 0.875rem 1rem;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-label {
  color: var(--m-text-muted);
  font-size: 0.75rem;
  white-space: nowrap;
  font-weight: 600;
}

.filter-select {
  padding: 0.45rem 0.75rem;
  padding-right: 2.2rem;
  background-color: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: 10px;
  color: var(--m-text);
  font-size: 0.8rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C5C5C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.search-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.45rem 1rem;
  padding-left: 2.2rem;
  padding-right: 2.2rem;
  background-color: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: 10px;
  color: var(--m-text);
  font-size: 0.8rem;
  width: 240px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.search-input::placeholder {
  color: var(--m-text-muted);
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  color: var(--m-text-muted);
  font-size: 0.8rem;
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--m-text-muted);
  cursor: pointer;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.clear-search:hover {
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
}

.search-btn {
  padding: 0.45rem 0.9rem;
  background-color: var(--m-accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

/* 订单统计 */
.order-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  flex: 1;
  min-width: 100px;
  background-color: var(--m-bg-secondary);
  border-radius: 14px;
  padding: 1.05rem 1rem;
  text-align: center;
  border: 1px solid var(--m-border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.stat-item:hover {
  transform: translateY(-3px);
  border-color: var(--m-accent);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.stat-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  color: var(--m-accent);
  font-family: var(--m-font-display);
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--m-text-muted);
  font-size: 0.78rem;
  font-weight: 500;
}

/* 订单表格 */
.orders-table-container {
  overflow-x: auto;
  background-color: var(--m-bg-secondary);
  border-radius: 14px;
  border: 1px solid var(--m-border);
  margin-bottom: 1.5rem;
}

.orders-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 0.95rem 1rem;
  text-align: left;
}

.orders-table th {
  background-color: var(--m-bg-tertiary);
  color: var(--m-text-muted);
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.orders-table th:first-child {
  border-radius: 14px 0 0 0;
}

.orders-table th:last-child {
  border-radius: 0 14px 0 0;
}

.order-row {
  border-bottom: 1px solid var(--m-border-light);
  transition: background-color 0.15s ease;
}

.order-row:hover {
  background-color: rgba(37, 99, 235, 0.02);
}

.order-row:last-child {
  border-bottom: none;
}

/* 表格列样式 */
.order-id-col {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  color: var(--m-text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  width: 160px;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.order-id-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-id-btn {
  opacity: 0;
  transition: opacity var(--m-transition);
  color: var(--m-text-muted);
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
}

.order-row:hover .copy-id-btn {
  opacity: 1;
}

.copy-id-btn:hover {
  color: var(--m-accent);
  background: var(--m-accent-light);
}

.game-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.game-icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--m-border-light);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.player-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--m-border-light);
}

.no-player {
  color: var(--m-text-muted);
  font-style: italic;
  font-size: 0.85rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.65rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.08);
  color: #d97706;
}
.status-pending::before { background: #d97706; }

.status-ongoing {
  background-color: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}
.status-ongoing::before { background: #2563eb; animation: pulseDot 1.5s infinite; }

.status-completion-pending {
  background-color: rgba(6, 182, 212, 0.08);
  color: #0891b2;
}
.status-completion-pending::before { background: #0891b2; animation: pulseDot 1.5s infinite; }

.status-completed {
  background-color: rgba(16, 185, 129, 0.08);
  color: #059669;
}
.status-completed::before { background: #059669; }

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}
.status-cancelled::before { background: #dc2626; }

@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.order-amount-col {
  font-weight: 700;
  color: var(--m-accent);
  font-family: var(--m-font-display);
}

.order-date-col {
  color: var(--m-text-muted);
  font-size: 0.8rem;
  width: 140px;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}

.view-btn, .cancel-btn, .refund-btn {
  height: 2rem;
  padding: 0 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 600;
}

.view-btn {
  background-color: rgba(37, 99, 235, 0.06);
  color: var(--m-accent);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.view-btn:hover {
  background-color: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
}

.cancel-btn {
  background-color: rgba(239, 68, 68, 0.06);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.cancel-btn:hover {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.refund-btn {
  background-color: rgba(245, 158, 11, 0.06);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.refund-btn:hover {
  background-color: #d97706;
  color: white;
  border-color: #d97706;
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
  color: var(--m-border);
  margin-bottom: 1rem;
}

.no-orders-content p {
  color: var(--m-text-secondary);
  margin-bottom: 1.5rem;
}

.reset-filters {
  padding: 0.5rem 1rem;
  background-color: var(--m-accent-light);
  color: var(--m-accent);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
}

.reset-filters:hover {
  background-color: var(--m-accent);
  color: white;
}

/* 骨架屏 */
.skeleton-cell-wrap {
  padding: 0;
}

.loading-content p {
  color: var(--m-text-secondary);
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
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  cursor: pointer;
  transition: all var(--m-transition);
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--m-bg-tertiary);
  border-color: var(--m-accent);
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
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  cursor: pointer;
  transition: all var(--m-transition);
  font-size: 0.875rem;
}

.page-number:hover:not(.active) {
  background-color: var(--m-bg-tertiary);
  border-color: var(--m-accent);
}

.page-number.active {
  background-color: var(--m-accent);
  border-color: var(--m-accent);
  color: white;
  font-weight: 600;
}

.ellipsis {
  color: var(--m-text-muted);
  padding: 0 0.5rem;
}

.page-info {
  color: var(--m-text-secondary);
  font-size: 0.875rem;
  margin-left: 1rem;
}

/* 提示消息 */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--m-radius-sm);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  animation: fadeInUp 0.3s ease forwards;
  box-shadow: var(--m-shadow-lg);
}

.toast.success {
  background-color: var(--m-success);
}

.toast.error {
  background-color: var(--m-danger);
}

.toast i {
  font-size: 1.25rem;
}

/* 确认弹窗 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--m-border);
  animation: scaleIn 0.3s ease;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--m-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--m-text);
}

.close-modal {
  background: none;
  border: none;
  color: var(--m-text-muted);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--m-transition);
}

.close-modal:hover {
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: var(--m-text-secondary);
}

.form-grid-create {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.form-grid-create .search-input,
.form-grid-create .filter-select {
  width: 100%;
}

.filter-group-col {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* 创建订单弹窗优化 */
.co-backdrop {
  padding: 1rem;
}

.co-modal {
  max-width: 720px;
}

.co-layout {
  display: grid;
  grid-template-columns: minmax(0, 200px) 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 700px) {
  .co-layout {
    grid-template-columns: 1fr;
  }
}

.co-aside {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.co-game-card {
  background: var(--m-bg-tertiary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 0.75rem;
  text-align: center;
}

.co-game-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: var(--m-radius-sm);
}

.co-game-name {
  margin: 0.5rem 0 0.25rem;
  font-weight: 600;
  color: var(--m-text);
  font-size: 0.9rem;
}

.co-mini-label {
  display: block;
  font-size: 0.7rem;
  color: var(--m-text-muted);
  margin: 0.5rem 0 0.25rem;
  text-align: left;
}

.co-game-select {
  width: 100%;
}

.co-hall-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--m-accent);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: var(--m-radius-sm);
  border: 1px dashed var(--m-border);
  transition: all var(--m-transition);
}

.co-hall-link:hover {
  background: var(--m-accent-light);
}

.co-hint {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: var(--m-text-muted);
  line-height: 1.45;
}

.co-field-label {
  display: block;
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  margin: 0.65rem 0 0.35rem;
}

.co-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.co-chip {
  border: 1px solid var(--m-border);
  background: var(--m-bg-secondary);
  color: var(--m-text);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
  transition: border-color var(--m-transition), background var(--m-transition);
}

.co-chip:hover {
  border-color: var(--m-accent);
}

.co-chip.active {
  border-color: var(--m-accent);
  background: var(--m-accent-light);
}

.co-chip-sub {
  font-size: 0.65rem;
  color: var(--m-text-muted);
  margin-top: 0.15rem;
}

.co-amount-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.co-amt-pill {
  border: 1px solid var(--m-border);
  background: var(--m-bg-secondary);
  color: var(--m-text);
  border-radius: var(--m-radius-sm);
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--m-transition);
}

.co-amt-pill.active {
  border-color: var(--m-success);
  color: var(--m-success);
  background: var(--m-success-light);
}

.co-amount-input {
  width: 7rem;
  min-width: 0;
}

.co-player-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

@media (max-width: 500px) {
  .co-player-row {
    grid-template-columns: 1fr;
  }
}

.cancel-warning {
  color: var(--m-warning);
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: var(--m-warning-light);
  border-radius: var(--m-radius-sm);
  margin-bottom: 1.5rem;
}

.cancel-reason {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  font-family: inherit;
  resize: vertical;
}

.cancel-reason:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.refund-amount {
  margin-bottom: 1rem;
}

.refund-amount-label {
  display: block;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  margin-bottom: 0.5rem;
}

.refund-amount-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--m-accent);
  background-color: var(--m-bg-tertiary);
  padding: 0.75rem;
  border-radius: var(--m-radius-sm);
  border: 1px solid var(--m-border);
}

.refund-reason {
  margin-bottom: 1rem;
}

.refund-reason-label {
  display: block;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  margin-bottom: 0.5rem;
}

.refund-reason-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C5C5C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.refund-reason-select:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--m-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
  border: none;
  font-size: 0.875rem;
}

.modal-btn.cancel {
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
}

.modal-btn.cancel:hover {
  background-color: var(--m-border);
  color: var(--m-text);
}

.modal-btn.confirm {
  background-color: var(--m-danger);
  color: white;
}

.modal-btn.confirm:hover {
  background-color: #b91c1c;
}

.modal-btn.confirm.refund-confirm {
  background-color: var(--m-warning);
  color: white;
}

.modal-btn.confirm.refund-confirm:hover {
  background-color: #b45309;
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

  .form-grid-create {
    grid-template-columns: 1fr;
  }
}

.order-coin-balance {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  margin: 0 1.5rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(6, 182, 212, 0.08));
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  font-size: 0.85rem;
  color: var(--m-text-secondary);
}

.order-coin-balance i {
  color: #fbbf24;
}

.order-coin-balance strong {
  color: var(--m-text);
}

.coin-sep {
  color: var(--m-border);
}

.coin-warn {
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.coin-recharge-link {
  color: var(--m-accent);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.coin-recharge-link:hover {
  text-decoration: underline;
}

.coin-ok {
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
    