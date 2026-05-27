import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'  
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Profile from '../views/Profile.vue'
import Orders from '../views/Orders.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Notifications from '../views/Notifications.vue'
import AccountSettings from '../views/AccountSettings.vue'
import EscortDelta from '../views/EscortDelta.vue'
import PlayHall from '../views/PlayHall.vue'
import SupportCenter from '../views/SupportCenter.vue'
import HelpCenter from '../views/HelpCenter.vue'
import GameMap from '../views/GameMap.vue'
import PlayerDesk from '../views/PlayerDesk.vue'
import BossDesk from '../views/BossDesk.vue'
import JoinUs from '../views/JoinUs.vue'
import AdminTransactions from '../views/AdminTransactions.vue'
import DataStatistics from '../views/DataStatistics.vue'
import Wallet from '../views/Wallet.vue'
import AdminCoinManagement from '../views/AdminCoinManagement.vue'
import { getAuthToken } from '../api/token'
import { getEffectiveUserLevel } from '../utils/authLevel'

// ============================================================
// 【路由配置】栗帽游戏服务平台 - 前端路由规则
// 功能：定义页面路由映射、权限校验、页面标题
// 权限体系：3级角色 - 顾客(0) | 打手(1) | Boss管理员(2)
// 交互：路由跳转前自动校验登录态与角色权限
// ============================================================
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 默认重定向到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - 栗帽游戏服务平台',
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/register',  // 注册页面路由
    name: 'Register',
    component: Register,
    meta: {
      title: '注册 - 栗帽游戏服务平台',
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '首页 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/escort',
    name: 'EscortDelta',
    component: EscortDelta,
    meta: {
      title: ' escort delta - 栗帽游戏服务平台',
      requiresAuth: true,
      customerOnly: true // 仅顾客可见
    }
  },
  {
    path: '/play-hall',
    name: 'PlayHall',
    component: PlayHall,
    meta: {
      title: '打手大厅 - 栗帽游戏服务平台',
      requiresAuth: true,
      customerOnly: true // 仅顾客可见：浏览打手列表、预约打手
    }
  },
  {
    path: '/join-us',
    name: 'JoinUs',
    component: JoinUs,
    meta: {
      title: '加入我们 - 栗帽游戏服务平台',
      requiresAuth: true,
      customerOnly: true // 仅顾客可见：申请成为打手
    }
  },
  {
    path: '/player-desk',
    name: 'PlayerDesk',
    component: PlayerDesk,
    meta: {
      title: '打手工作台 - 栗帽游戏服务平台',
      requiresAuth: true,
      playerOnly: true // 仅打手可见：接单、拒单、申请完成
    }
  },
  {
    path: '/boss-desk',
    name: 'BossDesk',
    component: BossDesk,
    meta: {
      title: 'BOSS 控制台 - 栗帽游戏服务平台',
      requiresAuth: true,
      minUserLevel: 2 // Boss级别及以上：审核完成、转派订单、退款处理、违规管理、入驻审核
    }
  },
  {
    path: '/admin/transactions',
    name: 'AdminTransactions',
    component: AdminTransactions,
    meta: {
      title: '流水管理 - 栗帽游戏服务平台',
      requiresAuth: true,
      minUserLevel: 2 // Boss级别
    }
  },
  {
    path: '/admin/statistics',
    name: 'DataStatistics',
    component: DataStatistics,
    meta: {
      title: '数据统计 - 栗帽游戏服务平台',
      requiresAuth: true,
      minUserLevel: 2 // Boss级别：平台运营数据总览
    }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    meta: {
      title: '我的钱包 - 栗帽游戏服务平台',
      requiresAuth: true // 所有角色可见：栗币充值、交易流水
    }
  },
  {
    path: '/admin/coins',
    name: 'AdminCoinManagement',
    component: AdminCoinManagement,
    meta: {
      title: '栗币管理 - 栗帽游戏服务平台',
      requiresAuth: true,
      minUserLevel: 2 // Boss级别：管理用户栗币余额
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/account-settings',
    name: 'AccountSettings',
    component: AccountSettings,
    meta: {
      title: '账号设置 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: {
      title: '订单 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: {
      title: '订单详情 - 栗帽游戏服务平台',
      requiresAuth: true
    }
  },
  {
    path: '/support-center',
    name: 'SupportCenter',
    component: SupportCenter,
    meta: {
      title: '客服中心 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: '通知 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/help-center',
    name: 'HelpCenter',
    component: HelpCenter,
    meta: {
      title: '帮助中心 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/game-map',
    name: 'GameMap',
    component: GameMap,
    meta: {
      title: '游戏地图 - 栗帽游戏服务平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在 - 栗帽游戏服务平台'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory('/'), // 直接使用字符串
  routes
})

// 全局前置守卫 - 处理登录验证和页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth as boolean
  const isAuthenticated = !!getAuthToken()
  const isAuthPage = to.path === '/login' || to.path === '/register'
  
  if (requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  } else if (requiresAuth && isAuthenticated) {
    // 已登录：按账号等级分流（0=顾客 / 1=打手）
    const level = getEffectiveUserLevel()
    if (to.meta.customerOnly && level !== 0) {
      next('/dashboard')
      return
    }
    if (to.meta.playerOnly && level !== 1) {
      next('/dashboard')
      return
    }
    if (to.meta.minUserLevel != null && level < (to.meta.minUserLevel as number)) {
      next('/dashboard')
      return
    }
    next()
  } else if (isAuthPage && isAuthenticated) {
    // 已登录访问登录/注册页，优先回跳 redirect，其次首页（打手可回工作台）
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    next(redirect || '/dashboard')
  } else {
    next()
  }
})

export default router
