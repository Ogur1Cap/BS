<template>
  <div class="order-detail-page">
    <Header :current-user="currentUser" :user-avatar="userAvatar" @logout="handleLogout" />
    <main class="page-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">订单详情</h1>
          <router-link class="back-link" to="/orders">返回订单列表</router-link>
        </div>

        <div v-if="isLoading" class="loading">加载中...</div>
        <div v-else-if="!order" class="loading">未找到订单</div>
        <div v-else class="detail-card">
          <div class="row"><span>订单ID</span><b>{{ order.id }}</b></div>
          <div class="row"><span>游戏</span><b>{{ order.game }}</b></div>
          <div class="row"><span>服务</span><b>{{ order.serviceType }}</b></div>
          <div class="row"><span>状态</span><b>{{ order.statusText }}</b></div>
          <div class="row"><span>金额</span><b>¥{{ order.amount.toFixed(2) }}</b></div>
          <div class="row"><span>创建时间</span><b>{{ formatDate(order.createdAt) }}</b></div>
          <div class="row"><span>开始时间</span><b>{{ order.startTime ? formatDate(order.startTime) : '未安排' }}</b></div>
          <div class="row"><span>打手</span><b>{{ order.player?.name || '未分配' }}</b></div>
          <div class="row" v-if="order.completionRequestNote">
            <span>完成申请说明</span><b>{{ order.completionRequestNote }}</b>
          </div>
          <div class="row" v-if="order.refundRequested"><span>退款原因</span><b>{{ order.refundReason || '未填写' }}</b></div>

          <div class="actions">
            <input v-model="nextStartTime" class="time-input" type="datetime-local" />
            <button class="action-btn" @click="handleReschedule" :disabled="!canOperate">改期</button>
            <button class="action-btn danger" @click="handleRefund" :disabled="!canOperate">申请退款</button>
          </div>
        </div>
      </div>
    </main>
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

const route = useRoute()
const router = useRouter()
const currentUser = ref<{ username: string } | undefined>(undefined)
const userAvatar = ref('https://picsum.photos/id/237/200/200')
const order = ref<Order | null>(null)
const isLoading = ref(true)
const nextStartTime = ref('')

const canOperate = computed(() => {
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
  const updated = await ordersApi.rescheduleOrder({ orderId: order.value.id, startTime: new Date(nextStartTime.value).toISOString() })
  order.value = updated.find((item) => item.id === order.value?.id) || order.value
}

const handleRefund = async () => {
  if (!order.value) return
  const updated = await ordersApi.refundOrder({ orderId: order.value.id, reason: '用户在详情页申请退款' })
  order.value = updated.find((item) => item.id === order.value?.id) || order.value
}

const handleLogout = () => {
  localStorage.removeItem('delta_token')
  localStorage.removeItem('delta_user')
  sessionStorage.removeItem('delta_token')
  sessionStorage.removeItem('delta_user')
  router.push('/login')
}

onMounted(() => {
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user')
  if (!userStr) {
    router.push('/login')
    return
  }
  currentUser.value = JSON.parse(userStr)
  loadOrder()
})
</script>

<style scoped>
.order-detail-page { min-height: 100vh; background: #111827; color: #f3f4f6; }
.page-content { padding: 2rem 0 4rem; }
.container { width: 100%; max-width: 1000px; margin: 0 auto; padding: 0 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.page-title { font-size: 1.8rem; }
.back-link { color: #60a5fa; text-decoration: none; }
.loading { padding: 2rem; color: #9ca3af; }
.detail-card { background: #1f2937; border: 1px solid rgba(55,65,81,.5); border-radius: 12px; padding: 1rem; }
.row { display: flex; justify-content: space-between; gap: 1rem; padding: .6rem 0; border-bottom: 1px dashed rgba(55,65,81,.5); }
.row:last-child { border-bottom: none; }
.actions { margin-top: 1rem; display: flex; gap: .6rem; flex-wrap: wrap; }
.time-input { background: #111827; border: 1px solid rgba(55,65,81,.7); color: #f3f4f6; border-radius: 8px; padding: .5rem .6rem; }
.action-btn { border: none; border-radius: 8px; background: #2563eb; color: #fff; padding: .5rem .9rem; cursor: pointer; }
.action-btn.danger { background: #dc2626; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
</style>
