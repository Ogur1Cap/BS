<template>
  <section class="orders-section">
    <div class="orders-table">
      <div class="table-head">
        <span class="th th-id">订单ID</span>
        <span class="th th-game">游戏</span>
        <span class="th th-service">服务类型</span>
        <span class="th th-status">状态</span>
        <span class="th th-date">日期</span>
        <span class="th th-action">操作</span>
      </div>
      <div class="table-body">
        <router-link
          v-for="order in orders"
          :key="order.id"
          :to="'/orders/' + order.id"
          class="table-row"
        >
          <span class="td td-id">
            <span class="id-mono">#{{ order.id.slice(0, 8) }}</span>
          </span>
          <span class="td td-game">
            <span class="game-badge">{{ order.game }}</span>
          </span>
          <span class="td td-service">{{ order.serviceType }}</span>
          <span class="td td-status">
            <span :class="getOrderStatusClass(order.status)" class="status-pill">
              <span class="status-dot"></span>
              {{ order.statusText }}
            </span>
          </span>
          <span class="td td-date">{{ formatDate(order.date) }}</span>
          <span class="td td-action">
            <span class="action-link">查看详情 <i class="fa fa-chevron-right"></i></span>
          </span>
        </router-link>
        <div v-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fa fa-inbox"></i>
          </div>
          <p class="empty-text">暂无订单记录</p>
          <p class="empty-hint">去下单开始您的游戏体验吧</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface Order {
  id: string
  game: string
  serviceType: string
  status: 'completed' | 'ongoing' | 'pending' | 'cancelled' | 'completion_pending' | 'refund_requested' | 'refunded'
  statusText: string
  date: string
}

defineProps({
  orders: {
    type: Array as () => Order[],
    default: () => []
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'completed': return 'status-completed'
    case 'ongoing': return 'status-ongoing'
    case 'completion_pending': return 'status-pending'
    case 'pending': return 'status-pending'
    case 'cancelled': return 'status-cancelled'
    case 'refund_requested': return 'status-refund'
    case 'refunded': return 'status-cancelled'
    default: return 'status-pending'
  }
}
</script>

<style scoped>
.orders-table {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px;
  overflow: hidden;
}

.table-head {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 120px 140px 100px;
  padding: 0.875rem 1.25rem;
  background: var(--m-bg-tertiary);
  border-bottom: 1px solid var(--m-border);
}

.th {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--m-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 120px 140px 100px;
  padding: 0.95rem 1.25rem;
  border-bottom: 1px solid var(--m-border-light);
  align-items: center;
  transition: all 0.18s ease;
  text-decoration: none;
  color: inherit;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(37, 99, 235, 0.03);
}

.id-mono {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--m-text-secondary);
  letter-spacing: 0.03em;
}

.game-badge {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--m-accent);
  background: var(--m-accent-light);
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
}

.td-service {
  font-size: 0.85rem;
  color: var(--m-text);
}

.td-date {
  font-size: 0.8rem;
  color: var(--m-text-muted);
}

.action-link {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--m-accent);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.action-link i {
  font-size: 0.6rem;
}

.table-row:hover .action-link {
  opacity: 1;
  transform: translateX(0);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 100px;
  font-size: 0.73rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-completed {
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
}
.status-completed .status-dot {
  background: #059669;
}

.status-ongoing {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}
.status-ongoing .status-dot {
  background: #2563eb;
  animation: dotPulse 1.5s infinite;
}

.status-pending {
  background: rgba(245, 158, 11, 0.08);
  color: #d97706;
}
.status-pending .status-dot {
  background: #d97706;
  animation: dotPulse 1.5s infinite;
}

.status-cancelled {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}
.status-cancelled .status-dot {
  background: #9ca3af;
}

.status-refund {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}
.status-refund .status-dot {
  background: #ef4444;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--m-border);
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 0.95rem;
  color: var(--m-text-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--m-text-muted);
}

@media (max-width: 768px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
    padding: 1rem;
  }

  .td {
    display: flex;
    justify-content: space-between;
  }

  .td::before {
    content: attr(data-label);
    font-size: 0.7rem;
    color: var(--m-text-muted);
    font-weight: 500;
  }

  .action-link {
    opacity: 1;
    transform: none;
  }
}
</style>
