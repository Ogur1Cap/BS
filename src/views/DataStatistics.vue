<!--
  【数据统计】管理员平台运营数据总览
  功能：
    - 核心指标：总订单数/已完成/待接单/总用户/打手数/已取消
    - 财务概览：总收入/总退款/净收入/平台佣金
    - 用户分布：顾客数/打手数/Boss管理员数/受限用户
    - 订单分布：各状态数量 + 各游戏分类统计
  角色：仅 userLevel >= 2（Boss管理员）
-->
<template>
  <div class="st-page">
    <Header />

    <main class="st-main">
      <div class="container">
        <header class="st-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-chart-bar"></i> 数据统计 · 管理员</span>
              <h1 class="welcome-title">平台数据总览</h1>
              <p class="welcome-date">查看平台运营数据，包括订单统计、用户分布与财务状况。</p>
            </div>
            <button type="button" class="st-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新数据
            </button>
          </div>
        </header>

        <div v-if="error" class="st-error">
          <i class="fa fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-if="loading && !overview" class="st-loading">
          <i class="fa fa-spinner fa-spin"></i> 加载中…
        </div>

        <template v-if="overview">
          <section class="st-section">
            <div class="section-header">
              <h2 class="section-title"><i class="fa fa-gauge-high"></i> 核心指标</h2>
              <span class="section-line"></span>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon icon-blue">
                  <i class="fa fa-shopping-cart"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.totalOrders }}</span>
                  <span class="stat-desc">总订单数</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-green">
                  <i class="fa fa-check-circle"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.completedOrders }}</span>
                  <span class="stat-desc">已完成</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-yellow">
                  <i class="far fa-clock"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.pendingOrders }}</span>
                  <span class="stat-desc">待接单</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-purple">
                  <i class="fa fa-users"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.totalUsers }}</span>
                  <span class="stat-desc">总用户</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-teal">
                  <i class="fa fa-user-secret"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.playerCount }}</span>
                  <span class="stat-desc">打手数</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon icon-red">
                  <i class="fa fa-times-circle"></i>
                </div>
                <div class="stat-body">
                  <span class="stat-num">{{ overview.cancelledOrders }}</span>
                  <span class="stat-desc">已取消</span>
                </div>
              </div>
            </div>
          </section>

          <section class="st-section">
            <div class="section-header">
              <h2 class="section-title"><i class="fa fa-credit-card"></i> 财务概览</h2>
              <span class="section-line"></span>
            </div>
            <div class="finance-grid">
              <div class="finance-card income">
                <span class="finance-label">总收入</span>
                <span class="finance-value">¥{{ formatAmount(overview.totalIncome) }}</span>
              </div>
              <div class="finance-card expense">
                <span class="finance-label">总支出</span>
                <span class="finance-value">¥{{ formatAmount(overview.totalExpense) }}</span>
              </div>
              <div class="finance-card net">
                <span class="finance-label">净收益</span>
                <span class="finance-value">¥{{ formatAmount(overview.netRevenue) }}</span>
              </div>
            </div>
          </section>

          <div class="st-columns">
            <section class="st-section st-section-half">
              <div class="section-header">
                <h2 class="section-title"><i class="fa fa-pie-chart"></i> 订单状态分布</h2>
                <span class="section-line"></span>
              </div>
              <div v-if="!ordersByStatus.length" class="st-empty">暂无数据</div>
              <div v-else class="bar-chart">
                <div v-for="item in ordersByStatus" :key="item.status" class="bar-row">
                  <span class="bar-label">{{ item.label }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :style="{ width: barPercent(item.count) }"
                      :class="'bar-' + item.status.toLowerCase()"
                    ></div>
                  </div>
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </section>

            <section class="st-section st-section-half">
              <div class="section-header">
                <h2 class="section-title"><i class="fa fa-group"></i> 用户角色分布</h2>
                <span class="section-line"></span>
              </div>
              <div v-if="!usersByLevel.length" class="st-empty">暂无数据</div>
              <div v-else class="bar-chart">
                <div v-for="item in usersByLevel" :key="item.level" class="bar-row">
                  <span class="bar-label">{{ item.label }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :style="{ width: userBarPercent(item.count) }"
                      :class="'bar-level-' + item.level"
                    ></div>
                  </div>
                  <span class="bar-count">{{ item.count }}</span>
                </div>
              </div>
            </section>
          </div>
        </template>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { statisticsApi } from '../api/statisticsApi'
import type { OverviewStats, StatusCount, UserLevelCount } from '../types/statistics'

const overview = ref<OverviewStats | null>(null)
const ordersByStatus = ref<StatusCount[]>([])
const usersByLevel = ref<UserLevelCount[]>([])
const loading = ref(true)
const error = ref('')

function formatAmount(val: number): string {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const maxOrderCount = ref(0)
const maxUserCount = ref(0)

function barPercent(count: number): string {
  if (maxOrderCount.value <= 0) return '0%'
  return ((count / maxOrderCount.value) * 100).toFixed(1) + '%'
}

function userBarPercent(count: number): string {
  if (maxUserCount.value <= 0) return '0%'
  return ((count / maxUserCount.value) * 100).toFixed(1) + '%'
}

async function loadAll() {
  loading.value = true
  error.value = ''
  const results = await Promise.allSettled([
    statisticsApi.getOverview(),
    statisticsApi.getOrdersByStatus(),
    statisticsApi.getUsersByLevel()
  ])
  {
    const r0 = results[0]
    if (r0.status === 'fulfilled') overview.value = r0.value
    else console.error('统计概览加载失败:', r0.reason)
  }
  {
    const r1 = results[1]
    if (r1.status === 'fulfilled') {
      ordersByStatus.value = r1.value
      maxOrderCount.value = Math.max(...r1.value.map(o => o.count), 1)
    } else console.error('订单状态统计加载失败:', r1.reason)
  }
  {
    const r2 = results[2]
    if (r2.status === 'fulfilled') {
      usersByLevel.value = r2.value
      maxUserCount.value = Math.max(...r2.value.map(u => u.count), 1)
    } else console.error('用户等级统计加载失败:', r2.reason)
  }
  loading.value = false
}

onMounted(() => {
  void loadAll()
})
</script>

<style scoped>
.st-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
  font-family: var(--m-font-body);
}

.st-main {
  padding: 2.5rem 0 4rem;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.st-hero {
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 2rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.st-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.st-hero:hover::before {
  transform: scaleY(1);
}

.welcome {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.welcome-text {
  flex: 1;
  min-width: 300px;
}

.welcome-greeting {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--m-accent);
  margin-bottom: 0.75rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--m-text);
}

.welcome-date {
  margin: 0;
  color: var(--m-text-secondary);
  max-width: 36rem;
  line-height: 1.5;
}

.st-refresh {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text);
  border-radius: var(--m-radius-sm);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all var(--m-transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.st-refresh:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.st-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.st-error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: var(--m-radius-sm);
  color: #fca5a5;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.st-loading,
.st-empty {
  text-align: center;
  padding: 2rem;
  color: var(--m-text-secondary);
}

.st-section {
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.st-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.st-section:hover::before {
  transform: scaleY(1);
}

.st-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .st-columns {
    grid-template-columns: 1fr;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--m-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1.15rem 1.25rem;
  transition: all var(--m-transition);
}

.stat-card:hover {
  border-color: var(--m-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.icon-blue { background-color: rgba(59, 130, 246, 0.15); color: #93c5fd; }
.icon-green { background-color: rgba(16, 185, 129, 0.15); color: #34d399; }
.icon-yellow { background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.icon-purple { background-color: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.icon-teal { background-color: rgba(6, 182, 212, 0.15); color: #67e8f9; }
.icon-red { background-color: rgba(239, 68, 68, 0.15); color: #f87171; }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--m-text);
  line-height: 1;
}

.stat-desc {
  font-size: 0.75rem;
  color: var(--m-text-secondary);
}

.finance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.finance-card {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all var(--m-transition);
}

.finance-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.finance-card.income { border-left: 3px solid #34d399; }
.finance-card.expense { border-left: 3px solid #f87171; }
.finance-card.net { border-left: 3px solid var(--m-accent); }

.finance-label {
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  font-weight: 600;
}

.finance-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--m-font-display);
}

.finance-card.income .finance-value { color: #34d399; }
.finance-card.expense .finance-value { color: #f87171; }
.finance-card.net .finance-value { color: var(--m-accent); }

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  width: 5rem;
  font-size: 0.8rem;
  color: var(--m-text-secondary);
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 1.5rem;
  background-color: var(--m-bg);
  border-radius: 0.25rem;
  overflow: hidden;
  border: 1px solid var(--m-border-light);
}

.bar-fill {
  height: 100%;
  border-radius: 0.25rem;
  transition: width 0.6s ease;
  min-width: 4px;
}

.bar-pending { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bar-in_progress { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-completion_pending { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.bar-completed { background: linear-gradient(90deg, #10b981, #34d399); }
.bar-cancelled { background: linear-gradient(90deg, #6b7280, #9ca3af); }
.bar-refund_requested { background: linear-gradient(90deg, #ef4444, #f87171); }
.bar-refunded { background: linear-gradient(90deg, #dc2626, #ef4444); }

.bar-level-0 { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-level-1 { background: linear-gradient(90deg, #10b981, #34d399); }
.bar-level-2 { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

.bar-count {
  width: 2.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--m-text);
  text-align: right;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .st-hero {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    padding: 0.85rem;
  }

  .stat-num {
    font-size: 1.2rem;
  }

  .bar-label {
    width: 3.5rem;
    font-size: 0.7rem;
  }

  .finance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
