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
          :user-level="userLevel"
        />
        
        <!-- 快捷服务 -->
        <section class="services-section">
          <h2 class="section-title">
            <i class="fa fa-rocket"></i> 快捷服务
          </h2>
          <div class="services-grid">
            <!-- 服务卡片 -->
            <ServiceCard 
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
              title="选择打手"
              description="浏览精英玩家列表"
              icon="fa fa-users"
              link="/play-hall"
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
        <section class="games-section">
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
import { GAME_LIST } from '../constants/games';
import { useUserStore } from '../stores/user';

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

const userLevel = ref('白银会员');
const completedOrders = computed(() => recentOrders.value.filter((order) => order.status === 'completed').length);
const ongoingOrders = computed(() => recentOrders.value.filter((order) => order.status === 'ongoing').length);

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