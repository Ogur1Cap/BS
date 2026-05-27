<template>
  <header class="header">
    <div class="header-inner">
      <router-link to="/dashboard" class="brand">
        <span class="brand-mark">△</span>
        <span class="brand-name">DELTA</span>
      </router-link>

      <nav class="nav desktop-nav">
        <router-link to="/dashboard" class="nav-link" :class="{ active: isCurrentRoute('/dashboard') }">首页</router-link>
        <router-link v-if="isCustomerNav" to="/escort" class="nav-link" :class="{ active: isCurrentRoute('/escort') }">护航服务</router-link>
        <router-link to="/orders" class="nav-link" :class="{ active: isCurrentRoute('/orders') }">我的订单</router-link>
        <router-link v-if="isCustomerNav" to="/play-hall" class="nav-link" :class="{ active: isCurrentRoute('/play-hall') }">打手大厅</router-link>
        <router-link v-if="isPlayerNav" to="/player-desk" class="nav-link" :class="{ active: isCurrentRoute('/player-desk') }">工作台</router-link>
        <router-link v-if="isBossNav" to="/boss-desk" class="nav-link" :class="{ active: isCurrentRoute('/boss-desk') }">控制台</router-link>
        <router-link v-if="isBossNav" to="/admin/transactions" class="nav-link" :class="{ active: isCurrentRoute('/admin/transactions') }">流水</router-link>
        <router-link v-if="isBossNav" to="/admin/statistics" class="nav-link" :class="{ active: isCurrentRoute('/admin/statistics') }">统计</router-link>
        <router-link v-if="isBossNav" to="/admin/coins" class="nav-link" :class="{ active: isCurrentRoute('/admin/coins') }">栗币</router-link>
        <router-link to="/game-map" class="nav-link" :class="{ active: isCurrentRoute('/game-map') }">游戏地图</router-link>
        <router-link to="/support-center" class="nav-link" :class="{ active: isCurrentRoute('/support-center') }">客服</router-link>
      </nav>

      <div class="header-right">
        <router-link to="/wallet" class="coin-balance" v-if="isAuthenticated">
          <i class="fa fa-coins"></i>
          <span class="coin-amount">{{ walletStore.balanceDisplay }} 🪙</span>
        </router-link>

        <NotificationDropdown />

        <div class="user-menu" ref="userMenuRef">
          <button class="user-btn" @click="toggleUserMenu">
            <img :src="displayAvatar" :alt="displayName" class="avatar">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-chevron" :class="{ open: userMenuOpen }">›</span>
          </button>

          <div v-if="userMenuOpen" class="dropdown">
            <router-link to="/profile" class="dropdown-item" @click="userMenuOpen = false">
              <span>个人资料</span>
            </router-link>
            <router-link to="/account-settings" class="dropdown-item" @click="userMenuOpen = false">
              <span>账户设置</span>
            </router-link>
            <router-link to="/wallet" class="dropdown-item" @click="userMenuOpen = false">
              <span><i class="fa fa-coins"></i> 我的钱包</span>
            </router-link>
            <router-link to="/notifications" class="dropdown-item" @click="userMenuOpen = false">
              <span>通知中心</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" @click="handleLogout">
              <span>退出登录</span>
            </button>
          </div>
        </div>

        <button class="menu-btn mobile-menu-btn" @click="toggleMobileMenu" aria-label="菜单">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-nav">
      <router-link to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">首页</router-link>
      <router-link v-if="isCustomerNav" to="/escort" class="mobile-nav-link" @click="closeMobileMenu">护航服务</router-link>
      <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">我的订单</router-link>
      <router-link v-if="isCustomerNav" to="/play-hall" class="mobile-nav-link" @click="closeMobileMenu">打手大厅</router-link>
      <router-link v-if="isPlayerNav" to="/player-desk" class="mobile-nav-link" @click="closeMobileMenu">工作台</router-link>
      <router-link v-if="isBossNav" to="/boss-desk" class="mobile-nav-link" @click="closeMobileMenu">控制台</router-link>
      <router-link v-if="isBossNav" to="/admin/transactions" class="mobile-nav-link" @click="closeMobileMenu">流水管理</router-link>
      <router-link v-if="isBossNav" to="/admin/statistics" class="mobile-nav-link" @click="closeMobileMenu">数据统计</router-link>
      <router-link v-if="isBossNav" to="/admin/coins" class="mobile-nav-link" @click="closeMobileMenu">栗币管理</router-link>
      <router-link to="/game-map" class="mobile-nav-link" @click="closeMobileMenu">游戏地图</router-link>
      <router-link to="/support-center" class="mobile-nav-link" @click="closeMobileMenu">客服中心</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getAuthUser } from '../api/token'
import { useRouter } from 'vue-router'
import NotificationDropdown from '../components/NotificationDropdown.vue'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notifications'
import { useWalletStore } from '../stores/wallet'
import { removeAuthToken, removeAuthUser } from '../api/token'

const props = defineProps<{
  currentUser?: { username?: string }
  userAvatar?: string
}>()

const emit = defineEmits<{ logout: [] }>()

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const userMenuRef = ref<HTMLElement | null>(null)
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const displayName = computed(() => props.currentUser?.username?.trim() || userStore.displayName)
const displayAvatar = computed(() => props.userAvatar?.trim() || userStore.resolvedAvatarUrl)

const walletStore = useWalletStore()
const isAuthenticated = computed(() => !!getAuthUser())

const effLevel = computed(() => {
  const p = userStore.profile?.userLevel
  if (typeof p === 'number') return p
  return getAuthUser()?.userLevel ?? 0
})

const isCustomerNav = computed(() => effLevel.value === 0)
const isPlayerNav = computed(() => effLevel.value === 1)
const isBossNav = computed(() => effLevel.value >= 2)

const isCurrentRoute = (path: string) => {
  const currentPath = router.currentRoute.value.path as string
  return currentPath === path || currentPath.startsWith(path + '/')
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
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
  userMenuOpen.value = false
  router.push('/login')
}

const handleClickOutside = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  walletStore.ensureLoaded()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--m-border);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
  text-decoration: none;
}

.brand-mark {
  font-family: var(--m-font-display);
  font-size: 1.35rem;
  color: var(--m-accent);
  line-height: 1;
}

.brand-name {
  font-family: var(--m-font-body);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--m-text);
}

.nav {
  display: none;
  align-items: center;
  gap: 0;
}

@media (min-width: 1024px) {
  .nav {
    display: flex;
  }
}

.nav-link {
  padding: 0.45rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--m-text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--m-text);
  background: var(--m-bg-tertiary);
}

.nav-link.active {
  color: var(--m-accent);
  background: var(--m-accent-light);
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.coin-balance {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.8rem;
  background: linear-gradient(135deg, #0f1f3d, #1e3a5f);
  border-radius: 100px;
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.coin-balance:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  border-color: rgba(37, 99, 235, 0.5);
}

.coin-balance i {
  font-size: 0.8rem;
  color: #fbbf24;
}

.coin-amount {
  white-space: nowrap;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  border-radius: 100px;
  border: 1px solid var(--m-border);
  transition: all 0.2s ease;
  background: transparent;
  cursor: pointer;
}

.user-btn:hover {
  border-color: var(--m-accent);
  background: var(--m-accent-light);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.user-btn:hover .avatar {
  border-color: var(--m-accent);
}

.user-name {
  font-size: 0.85rem;
  color: var(--m-text);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}

.user-chevron {
  font-size: 0.7rem;
  color: var(--m-text-muted);
  transition: transform 0.2s ease;
}

.user-chevron.open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.625rem);
  right: 0;
  min-width: 200px;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  animation: dropdownIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-size: 0.85rem;
  color: var(--m-text-secondary);
  border-radius: 10px;
  transition: all 0.15s ease;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

.dropdown-item:hover {
  background: var(--m-accent-light);
  color: var(--m-accent);
}

.dropdown-item.logout {
  color: var(--m-danger);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.06);
  color: var(--m-danger);
}

.dropdown-divider {
  height: 1px;
  background: var(--m-border);
  margin: 0.25rem 0.85rem;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 38px;
  height: 38px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--m-border);
  transition: all 0.2s ease;
  background: transparent;
  cursor: pointer;
}

.menu-btn:hover {
  background: var(--m-bg-tertiary);
  border-color: var(--m-accent);
}

.menu-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--m-text);
  border-radius: 2px;
  transition: all 0.2s ease;
}

@media (min-width: 1024px) {
  .menu-btn {
    display: none;
  }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1.5rem 1rem;
  border-top: 1px solid var(--m-border);
  background: var(--m-bg-secondary);
  animation: mobileNavIn 0.2s ease;
}

@keyframes mobileNavIn {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav-link {
  padding: 0.7rem 0;
  font-size: 0.9rem;
  color: var(--m-text-secondary);
  border-bottom: 1px solid var(--m-border-light);
  text-decoration: none;
  transition: color 0.15s ease;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-nav-link:hover {
  color: var(--m-accent);
}
</style>
