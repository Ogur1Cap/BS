<template>
  <div class="dashboard-container">
    <!-- 头部导航 -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      :unread-notifications="unreadNotifications"
      @logout="handleLogout"
    />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区域 -->
        <WelcomeBanner 
          :username="currentUser?.username || ''"
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
              link="/players"
            />
            <ServiceCard 
              title="客服中心"
              description="随时为您解决问题"
              icon="fa fa-comments"
              link="/customer-service"
            />
          </div>
        </section>
        
        <!-- 热门游戏 -->
        <section class="games-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa fa-gamepad"></i> 热门游戏
            </h2>
            <router-link to="/games" class="see-more">查看全部</router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { type Order } from '../components/Dashboard/OrderTable.vue';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import WelcomeBanner from '../components/Dashboard/WelcomeBanner.vue';
import ServiceCard from '../components/Dashboard/ServiceCard.vue';
import GameCard from '../components/Dashboard/GameCard.vue';
import OrderTable from '../components/Dashboard/OrderTable.vue';


// 路由实例
const router = useRouter();

// 用户信息
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200'); // 默认头像
const userLevel = ref('白银会员');
const completedOrders = ref(12);
const ongoingOrders = ref(2);
const unreadNotifications = ref(3);

// 热门游戏数据
const popularGames = ref([
  {
    id: 1,
    name: '三角洲行动',
    imageUrl: 'https://picsum.photos/id/237/400/200',
    players: 1243,
    rating: 4.8
  },
  {
    id: 2,
    name: '绝地求生',
    imageUrl: 'https://picsum.photos/id/238/400/200',
    players: 987,
    rating: 4.6
  },
  {
    id: 3,
    name: '使命召唤',
    imageUrl: 'https://picsum.photos/id/239/400/200',
    players: 756,
    rating: 4.7
  },
  {
    id: 4,
    name: 'Apex英雄',
    imageUrl: 'https://picsum.photos/id/240/400/200',
    players: 632,
    rating: 4.5
  }
]);

// 明确指定recentOrders的类型为Order[]
const recentOrders = ref<Order[]>([
  {
    id: 'ORD-87621',
    game: '三角洲行动',
    serviceType: '全程护航',
    status: 'completed', // 符合Order接口的status类型
    statusText: '已完成',
    date: '2023-10-15T14:30:00'
  },
  {
    id: 'ORD-87542',
    game: '绝地求生',
    serviceType: '段位提升',
    status: 'ongoing', // 符合Order接口的status类型
    statusText: '进行中',
    date: '2023-10-16T09:15:00'
  },
  {
    id: 'ORD-87459',
    game: '使命召唤',
    serviceType: '任务代练',
    status: 'completed', // 符合Order接口的status类型
    statusText: '已完成',
    date: '2023-10-12T19:45:00'
  }
]);

// 处理登出
const handleLogout = () => {
  // 清除存储的登录信息
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  
  // 跳转到登录页
  router.push('/login');
};

// 页面加载时获取用户信息
onMounted(() => {
  // 从存储中获取用户信息
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    // 如果没有用户信息，跳转到登录页
    router.push('/login');
  }
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