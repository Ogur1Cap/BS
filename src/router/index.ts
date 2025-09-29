import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'  
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import Profile from '../views/Profile.vue'
import Orders from '../views/Orders.vue'
import Notifications from '../views/Notifications.vue'
import AccountSettings from '../views/AccountSettings.vue'
import EscortDelta from '../views/EscortDelta.vue'
import PlayHall from '../views/PlayHall.vue'
import SupportCenter from '../views/SupportCenter.vue'
import HelpCenter from '../views/HelpCenter.vue'

// 路由规则
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
      title: '登录 - 三角洲行动俱乐部',
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/register',  // 注册页面路由
    name: 'Register',
    component: Register,
    meta: {
      title: '注册 - 三角洲行动俱乐部',
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '首页 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/escort',
    name: 'EscortDelta',
    component: EscortDelta,
    meta: {
      title: ' escort delta - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/play-hall',
    name: 'PlayHall',
    component: PlayHall,
    meta: {
      title: '打手大厅 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/account-settings',
    name: 'AccountSettings',
    component: AccountSettings,
    meta: {
      title: '账号设置 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: {
      title: '订单 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/support-center',
    name: 'SupportCenter',
    component: SupportCenter,
    meta: {
      title: '客服中心 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: '通知 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/help-center',
    name: 'HelpCenter',
    component: HelpCenter,
    meta: {
      title: '帮助中心 - 三角洲行动俱乐部',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在 - 三角洲行动俱乐部'
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
  const isAuthenticated = !!localStorage.getItem('delta_token') || !!sessionStorage.getItem('delta_token')
  
  if (requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 已登录但访问登录页，重定向到首页
    next('/dashboard')
  } else if (to.path === '/register' && isAuthenticated) {
    // 已登录但访问注册页，重定向到首页
    next('/dashboard')
  } else {
    // 其他情况正常跳转
    next()
  }
})

export default router
