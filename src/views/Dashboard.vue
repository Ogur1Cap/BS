<!--
  【首页 Dashboard】用户登录后默认页面
  功能：
    - Hero区域：欢迎信息 + 角色标签（顾客/打手/管理员）+ 订单统计 + 栗币余额
    - 任务简报：显示当日护航任务提示
    - 通知横幅：未读通知提醒
    - 快捷服务：根据角色展示不同功能入口
    - 热门游戏：游戏卡片展示
    - 最近订单：最新5条订单预览
  角色：所有登录用户（内容根据角色动态展示）
-->
<template>
  <div class="dashboard">
    <Header />

    <main class="main">
      <div class="container">
        <section class="hero-section">
          <div class="hero-card">
            <div class="hero-bg-pattern"></div>
            <div class="hero-bg-orb orb-left"></div>
            <div class="hero-bg-orb orb-right"></div>
            <div class="hero-content">
              <div class="hero-text">
                <span class="hero-greeting">欢迎回来</span>
                <h1 class="hero-title">{{ userStore.displayName }}</h1>
                <p class="hero-date">{{ todayDate }}</p>
                <div class="hero-tags">
                  <span class="hero-tag" v-if="isCustomerAccount()">顾客</span>
                  <span class="hero-tag player-tag" v-if="isPlayerAccount()">打手</span>
                  <span class="hero-tag boss-tag" v-if="isBossAccount()">管理员</span>
                  <span class="hero-tag highrisk-tag" v-if="userStore.profile?.isHighRisk">高风险</span>
                </div>
              </div>
              <div class="hero-stats">
                <div class="hero-stat">
                  <div class="hero-stat-icon completed-icon">
                    <i class="fa fa-check-circle"></i>
                  </div>
                  <div class="hero-stat-body">
                    <span class="hero-stat-value">{{ completedOrders }}</span>
                    <span class="hero-stat-label">已完成</span>
                  </div>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat">
                  <div class="hero-stat-icon ongoing-icon">
                    <i class="fa fa-spinner"></i>
                  </div>
                  <div class="hero-stat-body">
                    <span class="hero-stat-value">{{ ongoingOrders }}</span>
                    <span class="hero-stat-label">进行中</span>
                  </div>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat">
                  <div class="hero-stat-icon wallet-icon">
                    <i class="fa fa-coins"></i>
                  </div>
                  <div class="hero-stat-body">
                    <span class="hero-stat-value">{{ walletStore.balanceDisplay }}</span>
                    <span class="hero-stat-label">栗币余额</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="hero-shape"></div>
          </div>
        </section>

        <section v-if="missionBrief" class="briefing-section">
          <div class="briefing">
            <div class="briefing-icon">
              <i class="far fa-lightbulb"></i>
            </div>
            <div class="briefing-body">
              <div class="briefing-header">
                <span class="briefing-tag">
                  <span class="briefing-dot"></span>
                  {{ missionBrief.tag }}
                </span>
                <span class="briefing-map-tag">{{ missionBrief.mapName }}</span>
              </div>
              <h3 class="briefing-title">{{ missionBrief.title }}</h3>
              <p class="briefing-tip">{{ missionBrief.tip }}</p>
            </div>
          </div>
        </section>

        <section v-if="notifStore.unreadCount > 0" class="notification-banner">
          <router-link to="/notifications" class="banner-link">
            <div class="banner-icon">
              <i class="fa fa-bell"></i>
              <span class="banner-badge">{{ notifStore.unreadCount }}</span>
            </div>
            <span class="banner-text">您有 <strong>{{ notifStore.unreadCount }}</strong> 条未读通知</span>
            <i class="fa fa-chevron-right banner-arrow"></i>
          </router-link>
        </section>

        <section v-if="isCustomerAccount() && userStore.profile?.status === 'RESTRICTED'" class="restricted-banner">
          <i class="fa fa-exclamation-triangle"></i>
          <span>您的账号目前处于受限状态，无法使用下单、接单等核心功能。请在个人中心查看违规记录。</span>
        </section>

        <section class="services-section">
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">快捷服务</h2>
              <span class="section-line"></span>
            </div>
          </div>
          <div class="services-grid">
            <ServiceCard
              v-if="isCustomerAccount() && userStore.profile?.status !== 'RESTRICTED'"
              title="护航服务"
              description="专业玩家为您护航"
              icon="fa-shield"
              link="/escort"
            />
            <ServiceCard
              title="订单管理"
              description="查看和管理订单"
              icon="fa-file-text"
              link="/orders"
            />
            <ServiceCard
              v-if="isCustomerAccount()"
              title="选择打手"
              description="浏览精英玩家"
              icon="fa-users"
              link="/play-hall"
            />
            <ServiceCard
              v-if="isCustomerAccount()"
              title="加入我们"
              description="申请成为打手"
              icon="fa-user-plus"
              link="/join-us"
            />
            <ServiceCard
              v-if="isPlayerAccount()"
              title="打手工作台"
              description="处理订单"
              icon="fa-user-secret"
              link="/player-desk"
            />
            <ServiceCard
              v-if="isBossAccount()"
              title="BOSS 控制台"
              description="管理平台"
              icon="fa-shield"
              link="/boss-desk"
            />
            <ServiceCard
              v-if="isBossAccount()"
              title="流水管理"
              description="资金记录"
              icon="fa-book"
              link="/admin/transactions"
            />
            <ServiceCard
              v-if="isBossAccount()"
              title="数据统计"
              description="运营数据"
              icon="fa-chart-bar"
              link="/admin/statistics"
            />
            <ServiceCard
              v-if="isBossAccount()"
              title="栗币管理"
              description="充值调整"
              icon="fa-coins"
              link="/admin/coins"
            />
            <ServiceCard
              title="客服中心"
              description="解决问题"
              icon="fa-headphones"
              link="/support-center"
            />
            <ServiceCard
              title="我的钱包"
              description="栗币充值"
              icon="fa-coins"
              link="/wallet"
            />
          </div>
        </section>

        <section v-if="isCustomerAccount()" class="games-section">
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">热门游戏</h2>
              <span class="section-line"></span>
            </div>
            <router-link to="/play-hall" class="section-link">查看全部 <i class="fa fa-arrow-right"></i></router-link>
          </div>
          <div class="games-grid">
            <GameCard
              v-for="game in popularGames"
              :key="game.id"
              :game="game"
            />
          </div>
        </section>

        <section class="orders-section">
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">最近订单</h2>
              <span class="section-line"></span>
            </div>
            <router-link to="/orders" class="section-link">查看全部 <i class="fa fa-arrow-right"></i></router-link>
          </div>
          <SkeletonTable v-if="isLoadingOrders" :rows="3" />
          <OrderTable v-else :orders="recentOrders" />
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ordersApi } from '../api/ordersApi'
import { missionBriefingApi } from '../api/missionBriefingApi'
import { GAME_LIST } from '../constants/games'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notifications'
import { useWalletStore } from '../stores/wallet'
import type { MissionBriefing } from '../types/missionBriefing'
import { isBossAccount, isCustomerAccount, isPlayerAccount } from '../utils/authLevel'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import ServiceCard from '../components/Dashboard/ServiceCard.vue'
import GameCard from '../components/Dashboard/GameCard.vue'
import OrderTable from '../components/Dashboard/OrderTable.vue'
import SkeletonTable from '../components/Common/SkeletonTable.vue'
import type { Order } from '../components/Dashboard/OrderTable.vue'

const userStore = useUserStore()
const notifStore = useNotificationStore()
const walletStore = useWalletStore()

const recentOrders = ref<Order[]>([])
const missionBrief = ref<MissionBriefing | null>(null)
const isLoadingOrders = ref(true)
const isLoadingBrief = ref(true)

const todayDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date().toLocaleDateString('zh-CN', options)
})

const completedOrders = computed(() =>
  recentOrders.value.filter(order => order.status === 'completed').length
)
const ongoingOrders = computed(() =>
  recentOrders.value.filter(order =>
    order.status === 'ongoing' || order.status === 'completion_pending'
  ).length
)

const gameOrderCounts = computed(() => {
  const counts: Record<string, number> = {}
  recentOrders.value.forEach(order => {
    counts[order.game] = (counts[order.game] || 0) + 1
  })
  return counts
})

const popularGames = computed(() => {
  return GAME_LIST.map((game, index) => {
    const basePlayers = [980, 756, 532, 341]
    const baseRating = [4.8, 4.5, 4.3, 4.1]
    const orderCount = gameOrderCounts.value[game.name] || 0
    return {
      id: game.id,
      name: game.name,
      imageUrl: game.imageUrl,
      players: basePlayers[index] + orderCount * 23,
      rating: Math.min(4.9, baseRating[index] + orderCount * 0.02)
    }
  })
})

onMounted(() => {
  isLoadingOrders.value = true
  ordersApi
    .listOrders()
    .then(items => {
      recentOrders.value = items.slice(0, 5).map(item => ({
        id: item.id,
        game: item.game,
        serviceType: item.serviceType,
        status: item.status,
        statusText: item.statusText,
        date: item.createdAt
      }))
    })
    .catch(() => {
      recentOrders.value = []
    })
    .finally(() => {
      isLoadingOrders.value = false
    })

  isLoadingBrief.value = true
  missionBriefingApi
    .getToday()
    .then(b => {
      missionBrief.value = b
    })
    .catch(() => {
      missionBrief.value = null
    })
    .finally(() => {
      isLoadingBrief.value = false
    })

  void notifStore.refreshUnreadCount().catch(() => {})
  walletStore.ensureLoaded().catch(() => {})
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--m-bg);
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 2rem 0 4rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── Hero Section ── */
.hero-section {
  margin-bottom: 1.75rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #0a1628 0%, #112240 40%, #1a365d 70%, #0f3460 100%);
  border: 1px solid rgba(37, 99, 235, 0.15);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(37, 99, 235, 0.08);
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 40%);
  pointer-events: none;
}

.hero-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.orb-left {
  width: 260px;
  height: 260px;
  top: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
}

.orb-right {
  width: 200px;
  height: 200px;
  bottom: -60px;
  right: -40px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
}

.hero-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2.25rem 2.5rem;
  z-index: 1;
}

.hero-text {
  flex: 1;
}

.hero-greeting {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #60a5fa;
  background: rgba(37, 99, 235, 0.12);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  margin-bottom: 0.75rem;
}

.hero-title {
  font-family: var(--m-font-display);
  font-size: 2.25rem;
  font-weight: 400;
  color: #f1f5f9;
  margin-bottom: 0.375rem;
  line-height: 1.2;
}

.hero-date {
  font-size: 0.9375rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.hero-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hero-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  letter-spacing: 0.04em;
}

.player-tag {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.boss-tag {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.highrisk-tag {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  animation: riskPulse 2s infinite;
}

@keyframes riskPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 0.12rem;
  flex-shrink: 0;
}

.hero-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
}

.hero-stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.completed-icon {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
}

.ongoing-icon {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.wallet-icon {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.hero-stat-body {
  display: flex;
  flex-direction: column;
}

.hero-stat-value {
  font-size: 1.35rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.1;
}

.hero-stat-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.2rem;
}

.hero-stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.08);
}

.hero-shape {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 280px;
  height: 120px;
  background: linear-gradient(135deg, transparent 60%, rgba(37, 99, 235, 0.04) 100%);
  clip-path: polygon(30% 0, 100% 0, 100% 100%);
  pointer-events: none;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hero-stat-divider {
    display: none;
  }

  .hero-stat {
    flex: 1;
    padding: 0.75rem;
    justify-content: center;
  }

  .container {
    padding: 0 1rem;
  }
}

/* ── Briefing ── */
.briefing-section {
  margin-bottom: 1.75rem;
}

.briefing {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #fefce8 0%, #fffbeb 70%, #fef9c3 100%);
  border: 1px solid rgba(217, 119, 6, 0.12);
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.briefing-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.briefing-body {
  flex: 1;
}

.briefing-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.briefing-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  background: rgba(217, 119, 6, 0.08);
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
}

.briefing-dot {
  width: 6px;
  height: 6px;
  background: #d97706;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.briefing-map-tag {
  font-size: 0.7rem;
  color: #92400e;
  background: rgba(146, 64, 14, 0.08);
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.briefing-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 0.3rem;
}

.briefing-tip {
  font-size: 0.9rem;
  color: #57534e;
  line-height: 1.55;
}

/* ── Notification Banner ── */
.notification-banner {
  margin-bottom: 1.75rem;
}

.banner-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #eff6ff, #ecfdf5);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 14px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.banner-link:hover {
  border-color: rgba(37, 99, 235, 0.25);
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.08);
  transform: translateY(-1px);
}

.banner-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 1.05rem;
  flex-shrink: 0;
}

.banner-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  flex: 1;
  font-size: 0.9rem;
  color: var(--m-text);
}

.banner-text strong {
  color: #2563eb;
}

.banner-arrow {
  color: #94a3b8;
  font-size: 0.85rem;
  transition: transform 0.2s ease;
}

.banner-link:hover .banner-arrow {
  transform: translateX(3px);
  color: #2563eb;
}

/* ── Restricted ── */
.restricted-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 12px;
  margin-bottom: 1.75rem;
  color: #dc2626;
  font-size: 0.85rem;
}

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--m-text);
  white-space: nowrap;
}

.section-line {
  display: block;
  height: 2px;
  width: 32px;
  background: var(--m-accent);
  border-radius: 1px;
}

.section-link {
  font-size: 0.8125rem;
  color: var(--m-accent);
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.section-link i {
  font-size: 0.7rem;
  transition: transform 0.2s ease;
}

.section-link:hover i {
  transform: translateX(2px);
}

/* ── Services Grid ── */
.services-section {
  margin-bottom: 2.5rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

/* ── Games Section ── */
.games-section {
  margin-bottom: 2.5rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

/* ── Orders Section ── */
.orders-section {
  margin-bottom: 1rem;
}
</style>
