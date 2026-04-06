<template>
  <div class="dashboard-container">
    <!-- 头部导航 -->
    <Header />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区域 -->
        <WelcomeBanner 
          :username="userStore.displayName"
          :completed-orders="completedOrders"
          :ongoing-orders="ongoingOrders"
          :user-level="dashboardMemberLabel"
        />

        <!-- 今日行动简报：后端 /delta/mission-briefing，失败则整块隐藏 -->
        <section v-if="missionBrief" class="briefing-section" aria-label="今日行动简报">
          <div class="briefing-card">
            <span class="briefing-tag">{{ missionBrief.tag }}</span>
            <h3 class="briefing-title">{{ missionBrief.title }} · {{ missionBrief.mapName }}</h3>
            <p class="briefing-tip">{{ missionBrief.tip }}</p>
            <span class="briefing-date">{{ missionBrief.date }}</span>
          </div>
        </section>

        <section v-if="notifStore.unreadCount > 0" class="unread-strip" aria-label="未读通知">
          <router-link to="/notifications" class="unread-strip-link">
            <i class="fa fa-bell" aria-hidden="true"></i>
            您有 {{ notifStore.unreadCount }} 条未读通知，点击查看
          </router-link>
        </section>
        
        <!-- 快捷服务 -->
        <section class="services-section">
          <h2 class="section-title">
            <i class="fa fa-rocket"></i> 快捷服务
          </h2>
          <div class="services-grid">
            <!-- 账号受限提示 -->
            <div v-if="userStore.profile?.status === 'RESTRICTED'" class="restricted-notice">
              <i class="fa fa-exclamation-triangle"></i>
              您的账号目前处于受限状态，无法使用下单、接单等核心功能。请在个人中心查看违规记录并处理。
            </div>

            <!-- 服务卡片 -->
            <ServiceCard 
              v-if="isCustomerAccount() && userStore.profile?.status !== 'RESTRICTED'"
              title="护航服务"
              description="专业玩家为您护航，轻松通关"
              icon="fa fa-shield"
              link="/escort"
            />
            <ServiceCard 
              title="订单管理"
              description="查看和管理您的所有订单"
              icon="fa fa-list-alt"
              link="/orders"
            />
            <ServiceCard 
              v-if="isCustomerAccount()"
              title="选择打手"
              description="浏览精英玩家列表"
              icon="fa fa-users"
              link="/play-hall"
            />
            <ServiceCard 
              v-if="isCustomerAccount()"
              title="加入我们"
              description="提交资料申请成为认证打手"
              icon="fa fa-user-plus"
              link="/join-us"
            />
            <ServiceCard 
              v-if="isPlayerAccount()"
              title="打手工作台"
              description="处理顾客指定您的订单，接单或拒单"
              icon="fa fa-briefcase"
              link="/player-desk"
            />
            <ServiceCard 
              v-if="isBossAccount()"
              title="BOSS 控制台"
              description="审核完成申请、转派订单并通知顾客"
              icon="fa fa-shield"
              link="/boss-desk"
            />
            <ServiceCard 
              title="客服中心"
              description="随时为您解决问题"
              icon="fa fa-comments"
              link="/support-center"
            />
          </div>
        </section>
        
        <!-- 热门游戏 -->
        <section v-if="isCustomerAccount()" class="games-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa fa-gamepad"></i> 热门游戏
            </h2>
            <router-link to="/play-hall" class="see-more">查看全部</router-link>
          </div>
          <div class="games-carousel">
            <GameCard 
              v-for="game in popularGames" 
              :key="game.id"
              :game="game"
            />
          </div>
        </section>
        
        <!-- 最近订单 -->
        <OrderTable :orders="recentOrders" />
      </div>
    </main>

    <!-- 页脚 -->
    <Footer />

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { type Order } from '../components/Dashboard/OrderTable.vue';
import { ordersApi } from '../api/ordersApi';
import { missionBriefingApi } from '../api/missionBriefingApi';
import { GAME_LIST } from '../constants/games';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notifications';
import type { MissionBriefing } from '../types/missionBriefing';
import { isBossAccount, isCustomerAccount, isPlayerAccount } from '../utils/authLevel';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import WelcomeBanner from '../components/Dashboard/WelcomeBanner.vue';
import ServiceCard from '../components/Dashboard/ServiceCard.vue';
import GameCard from '../components/Dashboard/GameCard.vue';
import OrderTable from '../components/Dashboard/OrderTable.vue';


// 路由实例
const router = useRouter();
const userStore = useUserStore();
const notifStore = useNotificationStore();

const userLevel = ref('白银会员');
/** 欢迎区第三项：打手显示身份标签 */
const dashboardMemberLabel = computed(() => {
  if (isBossAccount()) return '平台 BOSS'
  if (isPlayerAccount()) return '认证打手'
  return userLevel.value
});
const completedOrders = computed(() => recentOrders.value.filter((order) => order.status === 'completed').length);
const ongoingOrders = computed(() =>
  recentOrders.value.filter((order) => order.status === 'ongoing' || order.status === 'completion_pending').length
);

// 热门游戏数据
const popularGames = ref(
  GAME_LIST.map((game, index) => ({
    id: game.id,
    name: game.name,
    imageUrl: game.imageUrl,
    players: 1243 - index * 165,
    rating: 4.8 - index * 0.1
  }))
);

// 明确指定recentOrders的类型为Order[]
const recentOrders = ref<Order[]>([]);
const missionBrief = ref<MissionBriefing | null>(null);

// 页面加载
onMounted(() => {
  ordersApi
    .listOrders()
    .then((items) => {
      recentOrders.value = items
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          game: item.game,
          serviceType: item.serviceType,
          status: item.status,
          statusText: item.statusText,
          date: item.createdAt
        }));
    })
    .catch(() => {
      recentOrders.value = [];
    });

  missionBriefingApi
    .getToday()
    .then((b) => {
      missionBrief.value = b;
    })
    .catch(() => {
      missionBrief.value = null;
    });

  void notifStore.refreshUnreadCount().catch(() => {});
});
</script>

<style scoped>
/* 基础样式 */
.dashboard-container {
  min-height: 100vh;
  background-color: #111827;
  color: #f3f4f6;
  position: relative;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 主内容区域 */
.main-content {
  padding: 2rem 0 4rem;
}

/* 行动简报卡片 */
.briefing-section {
  margin-bottom: 2rem;
}
.briefing-card {
  position: relative;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85));
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.briefing-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.15);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}
.briefing-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}
.briefing-tip {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.95rem;
}
.briefing-date {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #64748b;
}

.unread-strip {
  margin-bottom: 1.5rem;
}
.unread-strip-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.unread-strip-link:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fff;
}

/* 服务区域 */
.services-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
  display: flex;
  align-items: center;
}

.section-title i {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.restricted-notice {
  grid-column: 1 / -1;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.restricted-notice i {
  font-size: 1.25rem;
  color: #ef4444;
}

/* 游戏区域 */
.games-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.see-more {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.see-more:hover {
  color: #60a5fa;
}

.games-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(128px);
  opacity: 0.1;
}

.blob-1 {
  top: -20rem;
  right: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #3b82f6;
}

.blob-2 {
  bottom: -20rem;
  left: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #8b5cf6;
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