<!--
  【订单详情页】查看订单完整信息
  功能：展示订单编号/游戏/服务/状态/金额/打手/时间 + 改期 + 申请退款
  交互：改期选择新时间 → 提交；退款选择原因 → 提交给Boss审核
  角色：所有登录用户
-->
<template>
  <div class="order-detail-page">
    <Header />
    <main class="page-content">
      <div class="container">
        <div class="page-header">
          <div class="page-header-left">
            <h1 class="page-title">订单详情</h1>
          </div>
          <router-link class="back-link" to="/orders">
            <i class="fa fa-chevron-left"></i> 返回订单列表
          </router-link>
        </div>

        <div v-if="isLoading" class="loading"><i class="fa fa-spinner fa-spin"></i> 加载中...</div>
        <div v-else-if="!order" class="loading"><i class="fa fa-exclamation-circle"></i> 未找到订单</div>
        <div v-else class="detail-card">
          <div class="detail-status-bar" :class="'status-bar-' + order.status">
            <span class="status-bar-icon">
              <i :class="orderStatusIcon"></i>
            </span>
            <span class="status-bar-text">{{ order.statusText }}</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-hashtag"></i> 订单编号</span>
              <span class="detail-value mono">#{{ order.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-gamepad"></i> 游戏</span>
              <span class="detail-value">{{ order.game }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-cog"></i> 服务类型</span>
              <span class="detail-value">{{ order.serviceType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-info-circle"></i> 订单状态</span>
              <span :class="'status-badge status-' + order.status">{{ order.statusText }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-coins"></i> 金额</span>
              <span class="detail-value amount">¥{{ order.amount.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-clock"></i> 创建时间</span>
              <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-calendar-alt"></i> 约定时间</span>
              <span class="detail-value">{{ order.startTime ? formatDate(order.startTime) : '未安排' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="fa fa-user-secret"></i> 打手</span>
              <span class="detail-value" v-if="order.player">{{ order.player.name }}</span>
              <span class="detail-value muted" v-else>未分配</span>
            </div>
            <div class="detail-item full-width" v-if="order.completionRequestNote">
              <span class="detail-label"><i class="fa fa-edit"></i> 完成申请说明</span>
              <span class="detail-value">{{ order.completionRequestNote }}</span>
            </div>
            <div class="detail-item full-width" v-if="order.refundRequested">
              <span class="detail-label"><i class="fa fa-undo"></i> 退款原因</span>
              <span class="detail-value">{{ order.refundReason || '未填写' }}</span>
            </div>
          </div>

          <div class="detail-actions" v-if="actionsVisible">
            <div class="action-group">
              <label class="action-label">改期时间</label>
              <div class="action-row">
                <input v-model="nextStartTime" class="time-input" type="datetime-local" />
                <button class="btn btn-reschedule" @click="handleReschedule" :disabled="!canReschedule || submitting">
                  <i class="fa fa-calendar-alt"></i> 提交改期
                </button>
              </div>
            </div>
            <div class="action-group">
              <button class="btn btn-refund" @click="openRefundDialog" :disabled="!canRefund || submitting">
                <i class="fa fa-undo"></i> 申请退款
              </button>
            </div>
          </div>
        </div>

        <div v-if="actionResult.message" class="action-toast" :class="actionResult.type">
          <i :class="actionResult.type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-circle'"></i>
          {{ actionResult.message }}
        </div>
      </div>
    </main>

    <div class="modal-backdrop" v-if="showRefundDialog" @click.self="showRefundDialog = false">
      <div class="modal refund-modal">
        <div class="modal-header">
          <h3 class="modal-title">申请退款</h3>
          <button class="close-modal" @click="showRefundDialog = false"><i class="fa fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">确定要为订单 <strong>#{{ order?.id }}</strong> 申请退款吗？</p>
          <div class="refund-info">
            <span>退款金额：</span><strong>¥{{ order?.amount.toFixed(2) }}</strong>
          </div>
          <label class="refund-label">退款原因</label>
          <select v-model="refundReason" class="refund-select">
            <option value="">选择退款原因</option>
            <option value="服务质量问题">服务质量问题</option>
            <option value="未按时完成">未按时完成</option>
            <option value="与描述不符">与描述不符</option>
            <option value="个人原因">个人原因</option>
            <option value="其他">其他</option>
          </select>
          <textarea
            v-model="refundDescription"
            class="refund-textarea"
            placeholder="详细描述退款原因（选填）"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showRefundDialog = false" :disabled="submitting">取消</button>
          <button class="modal-btn confirm" @click="confirmRefund" :disabled="submitting">
            <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
            <span>{{ submitting ? '提交中…' : '确认退款' }}</span>
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { ordersApi } from '../api/ordersApi'
import type { Order } from '../types/order'
import { useEscKey } from '../composables/useEscKey'

const route = useRoute()
const router = useRouter()
const order = ref<Order | null>(null)
const isLoading = ref(true)
const nextStartTime = ref('')
const submitting = ref(false)
const showRefundDialog = ref(false)

useEscKey(showRefundDialog, () => { showRefundDialog.value = false })
const refundReason = ref('')
const refundDescription = ref('')
const actionResult = ref<{ message: string; type: 'success' | 'error' }>({ message: '', type: 'success' })

const clearActionResult = () => {
  setTimeout(() => {
    actionResult.value = { message: '', type: 'success' }
  }, 3500)
}

const orderStatusIcon = computed(() => {
  if (!order.value) return 'fa-question-circle'
  switch (order.value.status) {
    case 'pending': return 'fa-clock'
    case 'ongoing': return 'fa-spinner fa-spin'
    case 'completion_pending': return 'fa-hourglass-half'
    case 'completed': return 'fa-check-circle'
    case 'cancelled': return 'fa-times-circle'
    case 'refund_requested': return 'fa-undo'
    case 'refunded': return 'fa-check-circle'
    default: return 'fa-info-circle'
  }
})

const actionsVisible = computed(() => {
  if (!order.value) return false
  return ['pending', 'ongoing'].includes(order.value.status)
})

const canReschedule = computed(() => {
  if (!order.value || !nextStartTime.value) return false
  return ['pending', 'ongoing'].includes(order.value.status)
})

const canRefund = computed(() => {
  if (!order.value) return false
  return ['pending', 'ongoing', 'completion_pending'].includes(order.value.status)
})

const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN')

const loadOrder = async () => {
  const orderId = String(route.params.id || '')
  if (!orderId) return
  isLoading.value = true
  try {
    order.value = await ordersApi.getOrderDetail(orderId)
    if (order.value?.startTime) {
      nextStartTime.value = new Date(order.value.startTime).toISOString().slice(0, 16)
    }
  } finally {
    isLoading.value = false
  }
}

const handleReschedule = async () => {
  if (!order.value || !nextStartTime.value) return
  submitting.value = true
  try {
    const updated = await ordersApi.rescheduleOrder({
      orderId: order.value.id,
      startTime: new Date(nextStartTime.value).toISOString()
    })
    const refreshed = Array.isArray(updated)
      ? updated.find((item) => item.id === order.value?.id)
      : updated
    if (refreshed) order.value = refreshed
    actionResult.value = { message: '改期成功', type: 'success' }
    clearActionResult()
  } catch {
    actionResult.value = { message: '改期失败，请重试', type: 'error' }
    clearActionResult()
  } finally {
    submitting.value = false
  }
}

const openRefundDialog = () => {
  refundReason.value = ''
  refundDescription.value = ''
  showRefundDialog.value = true
}

const confirmRefund = async () => {
  if (!order.value) return
  submitting.value = true
  try {
    const reason = refundDescription.value.trim() || refundReason.value || '用户在订单详情页申请退款'
    const updated = await ordersApi.refundOrder({ orderId: order.value.id, reason })
    const refreshed = Array.isArray(updated)
      ? updated.find((item) => item.id === order.value?.id)
      : updated
    if (refreshed) order.value = refreshed
    showRefundDialog.value = false
    actionResult.value = { message: '退款申请已提交', type: 'success' }
    clearActionResult()
  } catch {
    actionResult.value = { message: '退款申请失败，请重试', type: 'error' }
    clearActionResult()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: var(--m-bg);
  color: var(--m-text);
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding: 2rem 0 4rem;
}

.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--m-text);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--m-accent);
  text-decoration: none;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-link:hover {
  background-color: var(--m-accent-light);
}

.loading {
  padding: 3rem 1rem;
  color: var(--m-text-secondary);
  text-align: center;
  font-size: 0.9rem;
}

.loading i {
  margin-right: 0.4rem;
}

.detail-card {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 16px;
  overflow: hidden;
}

.detail-status-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--m-border-light);
}

.status-bar-pending { background: rgba(245, 158, 11, 0.05); color: #d97706; }
.status-bar-ongoing { background: rgba(37, 99, 235, 0.05); color: #2563eb; }
.status-bar-completion_pending { background: rgba(6, 182, 212, 0.05); color: #0891b2; }
.status-bar-completed { background: rgba(16, 185, 129, 0.05); color: #059669; }
.status-bar-cancelled { background: rgba(156, 163, 175, 0.06); color: #6b7280; }
.status-bar-refund_requested { background: rgba(239, 68, 68, 0.05); color: #dc2626; }
.status-bar-refunded { background: rgba(156, 163, 175, 0.06); color: #6b7280; }

.status-bar-icon {
  font-size: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 1.25rem 1.5rem;
}

.detail-item {
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--m-border-light);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item:nth-last-child(-n+2) { border-bottom: none; }
.detail-item.full-width { grid-column: 1 / -1; }

.detail-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--m-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--m-text);
}

.detail-value.mono {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-weight: 600;
  color: var(--m-text-secondary);
}

.detail-value.amount {
  font-weight: 700;
  color: var(--m-accent);
  font-family: var(--m-font-display);
}

.detail-value.muted {
  color: var(--m-text-muted);
  font-style: italic;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.18rem 0.6rem;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pending { background: rgba(245, 158, 11, 0.08); color: #d97706; }
.status-pending::before { background: #d97706; }
.status-ongoing { background: rgba(37, 99, 235, 0.08); color: #2563eb; }
.status-ongoing::before { background: #2563eb; animation: dotPulse 1.5s infinite; }
.status-completion_pending { background: rgba(6, 182, 212, 0.08); color: #0891b2; }
.status-completion_pending::before { background: #0891b2; animation: dotPulse 1.5s infinite; }
.status-completed { background: rgba(16, 185, 129, 0.08); color: #059669; }
.status-completed::before { background: #059669; }
.status-cancelled { background: rgba(156, 163, 175, 0.1); color: #6b7280; }
.status-cancelled::before { background: #9ca3af; }
.status-refund_requested { background: rgba(239, 68, 68, 0.08); color: #dc2626; }
.status-refund_requested::before { background: #ef4444; }
.status-refunded { background: rgba(156, 163, 175, 0.1); color: #6b7280; }
.status-refunded::before { background: #9ca3af; }

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.detail-actions {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--m-border);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.action-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--m-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.time-input {
  padding: 0.5rem 0.75rem;
  background: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: 10px;
  color: var(--m-text);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: var(--m-accent);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reschedule {
  background: rgba(37, 99, 235, 0.06);
  color: var(--m-accent);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.btn-reschedule:hover:not(:disabled) {
  background: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
}

.btn-refund {
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.btn-refund:hover:not(:disabled) {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.action-toast {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-toast.success {
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.action-toast.error {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.25rem;
  border-bottom: 1px solid var(--m-border);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--m-text);
}

.close-modal {
  background: none;
  border: 1px solid var(--m-border);
  color: var(--m-text-muted);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-modal:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.modal-body {
  padding: 1.25rem;
}

.modal-desc {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--m-text-secondary);
}

.refund-info {
  padding: 0.6rem 0.85rem;
  background: var(--m-bg);
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--m-text);
  display: flex;
  justify-content: space-between;
  border: 1px solid var(--m-border-light);
}

.refund-info strong {
  color: var(--m-accent);
  font-family: var(--m-font-display);
}

.refund-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--m-text-muted);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refund-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-right: 2rem;
  background: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: 10px;
  color: var(--m-text);
  font-size: 0.85rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C5C5C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.refund-select:focus {
  outline: none;
  border-color: var(--m-accent);
}

.refund-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: 10px;
  color: var(--m-text);
  font-size: 0.85rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.refund-textarea:focus {
  outline: none;
  border-color: var(--m-accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--m-border);
}

.modal-btn {
  padding: 0.5rem 1.1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-btn.cancel {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
}

.modal-btn.cancel:hover:not(:disabled) {
  border-color: var(--m-text-muted);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
}

.modal-btn.confirm:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
}
</style>
