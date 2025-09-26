<template>
  <section class="orders-section">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fa fa-history"></i> 最近订单
      </h2>
      <router-link to="/orders" class="see-more">查看全部</router-link>
    </div>
    <div class="orders-table">
      <table>
        <thead>
          <tr>
            <th class="order-id">订单ID</th>
            <th class="order-game">游戏</th>
            <th class="order-service">服务类型</th>
            <th class="order-status">状态</th>
            <th class="order-date">日期</th>
            <th class="order-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="order-id">{{ order.id }}</td>
            <td class="order-game">{{ order.game }}</td>
            <td class="order-service">{{ order.serviceType }}</td>
            <td class="order-status">
              <span :class="getOrderStatusClass(order.status)" class="status-badge">{{ order.statusText }}</span>
            </td>
            <td class="order-date">{{ formatDate(order.date) }}</td>
            <td class="order-action">
              <router-link :to="'/orders/' + order.id" class="view-details">查看详情</router-link>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="6" class="no-orders">您暂无订单记录</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, defineExpose } from 'vue';

// 定义订单数据类型
interface Order {
  id: string;
  game: string;
  serviceType: string;
  status: 'completed' | 'ongoing' | 'pending' | 'cancelled';
  statusText: string;
  date: string;
}

// 定义props
const props = defineProps({
  orders: {
    type: Array as () => Order[],
    default: () => []
  }
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return date.toLocaleDateString('zh-CN', options);
};

// 获取订单状态样式类
const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'status-completed';
    case 'ongoing':
      return 'status-ongoing';
    case 'pending':
      return 'status-pending';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-default';
  }
};

// 显式导出组件
defineExpose({
  props,
  formatDate,
  getOrderStatusClass
});
</script>

<style scoped>
.orders-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f3f4f6;
  display: flex;
  align-items: center;
}

.section-title i {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.see-more {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
}

.see-more:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.see-more i {
  margin-left: 0.25rem;
}

.orders-table {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

thead {
  background-color: rgba(31, 41, 55, 0.8);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #d1d5db;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

th:first-child {
  border-radius: 1rem 0 0 0;
}

th:last-child {
  border-radius: 0 1rem 0 0;
}

td {
  padding: 1rem;
  color: #f3f4f6;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

tr:last-child td {
  border-bottom: none;
}

.order-id {
  font-family: monospace;
  color: #9ca3af;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-ongoing {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.view-details {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.view-details:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.no-orders {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}
</style>