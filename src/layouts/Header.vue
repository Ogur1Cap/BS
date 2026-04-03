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
            <li v-if="isCustomerNav" class="nav-item" :class="{ 'active': isCurrentRoute('/escort') }">
              <router-link to="/escort" class="nav-link">护航服务</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/orders') }">
              <router-link to="/orders" class="nav-link">我的订单</router-link>
            </li>
            <li v-if="isCustomerNav" class="nav-item" :class="{ 'active': isCurrentRoute('/play-hall') }">
              <router-link to="/play-hall" class="nav-link">打手大厅</router-link>
            </li>
            <li v-if="isPlayerNav" class="nav-item" :class="{ 'active': isCurrentRoute('/player-desk') }">
              <router-link to="/player-desk" class="nav-link">打手工作台</router-link>
            </li>
            <li v-if="isBossNav" class="nav-item" :class="{ 'active': isCurrentRoute('/boss-desk') }">
              <router-link to="/boss-desk" class="nav-link">BOSS 控制台</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/game-map') }">
              <router-link to="/game-map" class="nav-link">游戏地图</router-link>
            </li>
            <li class="nav-item" :class="{ 'active': isCurrentRoute('/support-center') }">
              <router-link to="/support-center" class="nav-link">客服中心</router-link>
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
              <img :src="displayAvatar" alt="用户头像" class="avatar-img">
              <span class="user-name">{{ displayName }}</span>
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
                  <router-link to="/account-settings" class="menu-link">
                    <i class="fa fa-cog"></i> 账户设置
                  </router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/notifications" class="menu-link">
                    <i class="fa fa-bell"></i> 通知中心
                  </router-link>
                </li>
                <li v-if="isPlayerNav" class="menu-item">
                  <router-link to="/player-desk" class="menu-link">
                    <i class="fa fa-briefcase"></i> 打手工作台
                  </router-link>
                </li>
                <li v-if="isBossNav" class="menu-item">
                  <router-link to="/boss-desk" class="menu-link">
                    <i class="fa fa-shield"></i> BOSS 控制台
                  </router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/help-center" class="menu-link">
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
        <li v-if="isCustomerNav" class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/escort') }" >
          <router-link to="/escort" class="mobile-nav-link" @click="closeMobileMenu">护航服务</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/orders') }">
          <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">我的订单</router-link>
        </li>
        <li v-if="isCustomerNav" class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/play-hall') }">
          <router-link to="/play-hall" class="mobile-nav-link" @click="closeMobileMenu">打手大厅</router-link>
        </li>
        <li v-if="isPlayerNav" class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/player-desk') }">
          <router-link to="/player-desk" class="mobile-nav-link" @click="closeMobileMenu">打手工作台</router-link>
        </li>
        <li v-if="isBossNav" class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/boss-desk') }">
          <router-link to="/boss-desk" class="mobile-nav-link" @click="closeMobileMenu">BOSS 控制台</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/game-map') }">
          <router-link to="/game-map" class="mobile-nav-link" @click="closeMobileMenu">游戏地图</router-link>
        </li>
        <li class="mobile-nav-item" :class="{ 'active': isCurrentRoute('/support-center') }">
          <router-link to="/support-center" class="mobile-nav-link" @click="closeMobileMenu">客服中心</router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getAuthUser } from '../api/token'
import { useRouter } from 'vue-router'
import NotificationDropdown from '../components/NotificationDropdown.vue'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notifications'
import { removeAuthToken, removeAuthUser } from '../api/token'

// 可选覆盖（少数页面仍可传入）；默认使用全局用户仓库，保证全站一致
const props = defineProps<{
  currentUser?: { username?: string }
  userAvatar?: string
}>()

const emit = defineEmits<{ logout: [] }>()

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const displayName = computed(() => props.currentUser?.username?.trim() || userStore.displayName)
const displayAvatar = computed(() => props.userAvatar?.trim() || userStore.resolvedAvatarUrl)

const effLevel = computed(() => {
  const p = userStore.profile?.userLevel
  if (typeof p === 'number') return p
  return getAuthUser()?.userLevel ?? 0
})

/** 仅顾客：护航、打手大厅 */
const isCustomerNav = computed(() => effLevel.value === 0)

/** 打手（1 级）：工作台入口 */
const isPlayerNav = computed(() => effLevel.value === 1)

/** BOSS（2 级+）：控制台 */
const isBossNav = computed(() => effLevel.value >= 2)

const profileMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const isCurrentRoute = (path: string) => {
  const currentPath = router.currentRoute.value.path as string
  return currentPath === path || currentPath.startsWith(path + '/')
}

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogout = () => {
  userStore.clear()
  notificationStore.clearLocal()
  removeAuthToken()
  removeAuthUser()
  emit('logout')
  profileMenuOpen.value = false
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const profileBtn = document.querySelector('.profile-btn')
    const profileMenu = document.querySelector('.profile-menu')
    
    if (profileBtn && profileMenu && !profileBtn.contains(e.target as Node) && !profileMenu.contains(e.target as Node)) {
      profileMenuOpen.value = false
    }
  })
})
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
  color: #f3f4f6;
}

/* 主导航 */
.main-nav {
  display: none;
}

@media (min-width: 1024px) {
  .main-nav {
    display: block;
  }
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: block;
  padding: 0.5rem 0.75rem;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: color 0.2s, background-color 0.2s;
}

.nav-link:hover {
  color: #f3f4f6;
  background-color: rgba(55, 65, 81, 0.5);
}

.nav-item.active .nav-link {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-profile {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #f3f4f6;
  transition: background-color 0.2s;
}

.profile-btn:hover {
  background-color: rgba(55, 65, 81, 0.5);
}

.avatar-img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.5);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-btn .fa-chevron-down {
  font-size: 0.65rem;
  color: #9ca3af;
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.profile-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 12rem;
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.8);
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  padding: 0.5rem 0;
  z-index: 100;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item.divider {
  height: 1px;
  margin: 0.5rem 0;
  background-color: rgba(55, 65, 81, 0.8);
  padding: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;
}

.menu-link:hover {
  background-color: rgba(55, 65, 81, 0.6);
}

.menu-link i {
  width: 1.25rem;
  color: #9ca3af;
}

.logout-link {
  color: #f87171;
}

.logout-link i {
  color: #f87171;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: none;
  color: #f3f4f6;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 0.375rem;
}

.mobile-menu-btn:hover {
  background-color: rgba(55, 65, 81, 0.5);
}

@media (min-width: 1024px) {
  .mobile-menu-btn {
    display: none;
  }
}

/* 移动端导航 */
.mobile-nav {
  display: block;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
  background-color: rgba(17, 24, 39, 0.95);
  padding: 0.5rem 0;
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.mobile-nav-link {
  display: block;
  padding: 0.875rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.95rem;
}

.mobile-nav-item.active .mobile-nav-link {
  color: #3b82f6;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
