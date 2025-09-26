<template>
  <header class="main-header">
    <div class="container">
      <div class="header-content">
        <!-- 品牌标识 -->
        <div class="brand-logo">
          <i class="fa fa-shield"></i>
          <span class="logo-text">三角洲行动俱乐部</span>
        </div>
        
        <!-- 主导航 - 桌面端 -->
        <nav class="main-nav desktop-nav">
          <ul class="nav-list">
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/dashboard') }">
              <router-link to="/dashboard" class="nav-link">首页</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/escort') }">
              <router-link to="/escort" class="nav-link">护航服务</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/orders') }">
              <router-link to="/orders" class="nav-link">我的订单</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/ranking') }">
              <router-link to="/ranking" class="nav-link">玩家排行</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/customer-service') }">
              <router-link to="/customer-service" class="nav-link">客服中心</router-link>
            </li>
          </ul>
        </nav>
        
        <!-- 用户区域 -->
        <div class="user-area">
          <!-- 通知组件 -->
          <NotificationDropdown />
          
          <!-- 用户头像 -->
          <div class="user-profile">
            <button class="profile-btn" @click="toggleProfileMenu">
              <img :src="userAvatar" alt="用户头像" class="avatar-img">
              <span class="user-name">{{ currentUser?.username }}</span>
              <i class="fa fa-chevron-down" :class="{ 'rotate-180': profileMenuOpen }"></i>
            </button>
            
            <!-- 下拉菜单 -->
            <div class="profile-menu" v-if="profileMenuOpen">
              <ul class="menu-list">
                <li class="menu-item">
                  <router-link to="/profile" class="menu-link">
                    <i class="fa fa-user"></i> 个人资料
                  </router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/settings" class="menu-link">
                    <i class="fa fa-cog"></i> 账户设置
                  </router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/notifications" class="menu-link">
                    <i class="fa fa-bell"></i> 通知中心
                  </router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/help" class="menu-link">
                    <i class="fa fa-question-circle"></i> 帮助中心
                  </router-link>
                </li>
                <li class="menu-item divider"></li>
                <li class="menu-item">
                  <button @click="handleLogout" class="menu-link logout-link">
                    <i class="fa fa-sign-out"></i> 退出登录
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- 移动端菜单按钮 -->
          <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="菜单">
            <i class="fa fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 移动端导航菜单 -->
    <div class="mobile-nav" v-if="mobileMenuOpen">
      <ul class="mobile-nav-list">
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/dashboard') }">
          <router-link to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">首页</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/escort') }" >
          <router-link to="/escort" class="mobile-nav-link" @click="closeMobileMenu">护航服务</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/orders') }">
          <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">我的订单</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/ranking') }">
          <router-link to="/ranking" class="mobile-nav-link" @click="closeMobileMenu">玩家排行</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/customer-service') }">
          <router-link to="/customer-service" class="mobile-nav-link" @click="closeMobileMenu">客服中心</router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { defineProps, defineEmits } from 'vue';
import NotificationDropdown from '../components/NotificationDropdown.vue';// 导入通知组件

// 定义props
const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
    default: () => ({ username: '' })
  },
  userAvatar: {
    type: String,
    default: 'https://picsum.photos/id/237/200/200'
  }
});

// 定义事件
const emit = defineEmits(['logout']);

// 路由实例
const router = useRouter();

// 判断当前路由是否匹配指定路径
const isCurrentRoute = (path: string) => {
// 修正判断方法（添加类型断言，解决TS类型检查问题）
  const currentPath = router.currentRoute.value.path as string; // 类型断言
  return currentPath === path || currentPath.startsWith(path + '/');
};

// 菜单状态
const profileMenuOpen = ref(false);
const mobileMenuOpen = ref(false);

// 切换个人菜单
const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// 处理登出
const handleLogout = () => {
  emit('logout');
  profileMenuOpen.value = false;
};

// 点击页面其他区域关闭菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    const profileBtn = document.querySelector('.profile-btn');
    const profileMenu = document.querySelector('.profile-menu');
    
    if (profileBtn && profileMenu && !profileBtn.contains(e.target as Node) && !profileMenu.contains(e.target as Node)) {
      profileMenuOpen.value = false;
    }
  });
});
</script>

<style scoped>
/* 头部导航样式保持不变 */
.main-header {
  background-color: rgba(17, 24, 37, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

/* 品牌标识 */
.brand-logo {
  display: flex;
  align-items: center;
}

.brand-logo i {
  color: #3b82f6;
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 主导航 */
.main-nav {
  margin: 0 1rem;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 0.5rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  padding: 0.5rem 1rem;
  color: #9ca3af;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 0.375rem;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: rgba(55, 65, 81, 0.2);
}

.nav-item.active .nav-link {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-item.active .nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
  border-radius: 2px 2px 0 0;
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 用户头像区域样式保持不变 */
.user-profile {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #f3f4f6;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
}

.profile-btn:hover {
  background-color: rgba(55, 65, 81, 0.2);
}

.avatar-img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.user-name {
  font-weight: 500;
  display: none;
}

@media (min-width: 768px) {
  .user-name {
    display: block;
  }
}

.profile-btn i {
  color: #9ca3af;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 个人资料下拉菜单 */
.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 15rem;
  background-color: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(55, 65, 81, 0.5);
  z-index: 100;
  margin-top: 0.5rem;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.menu-list {
  list-style: none;
}

.menu-item {
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item.divider {
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
  padding: 0;
  margin: 0.25rem 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.3s ease;
  width: 100%;
}

.menu-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.menu-link i {
  width: 1.25rem;
  text-align: center;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.menu-link:hover i {
  color: #3b82f6;
}

.logout-link {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.logout-link i {
  color: #ef4444;
}

.logout-link:hover {
  color: #ef4444;
}

.logout-link:hover i {
  color: #ef4444;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  color: #3b82f6;
  background-color: rgba(55, 65, 81, 0.2);
}

.desktop-nav {
  display: none;
}

@media (min-width: 1024px) {
  .desktop-nav {
    display: block;
  }
  
  .mobile-menu-btn {
    display: none;
  }
}

/* 移动端导航菜单 */
.mobile-nav {
  background-color: #1f2937;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
  animation: slideDown 0.3s ease;
}

.mobile-nav-list {
  list-style: none;
}

.mobile-nav-item {
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.mobile-nav-item:last-child {
  border-bottom: none;
}

.mobile-nav-link {
  display: block;
  padding: 1rem;
  color: #d1d5db;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.mobile-nav-item.active .mobile-nav-link {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
    