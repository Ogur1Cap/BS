import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import NotFound from '../views/NotFound.vue';
import Profile from '../views/Profile.vue';
import Orders from '../views/Orders.vue';
import OrderDetail from '../views/OrderDetail.vue';
import Notifications from '../views/Notifications.vue';
import AccountSettings from '../views/AccountSettings.vue';
import EscortDelta from '../views/EscortDelta.vue';
import PlayHall from '../views/PlayHall.vue';
import SupportCenter from '../views/SupportCenter.vue';
import HelpCenter from '../views/HelpCenter.vue';
import GameMap from '../views/GameMap.vue';
import PlayerDesk from '../views/PlayerDesk.vue';
import BossDesk from '../views/BossDesk.vue';
import JoinUs from '../views/JoinUs.vue';
import { getAuthToken } from '../api/token';
import { getEffectiveUserLevel } from '../utils/authLevel';
// 路由规则
const routes = [
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
        path: '/register', // 注册页面路由
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
            requiresAuth: true,
            customerOnly: true
        }
    },
    {
        path: '/play-hall',
        name: 'PlayHall',
        component: PlayHall,
        meta: {
            title: '打手大厅 - 三角洲行动俱乐部',
            requiresAuth: true,
            customerOnly: true
        }
    },
    {
        path: '/join-us',
        name: 'JoinUs',
        component: JoinUs,
        meta: {
            title: '加入我们 - 三角洲行动俱乐部',
            requiresAuth: true,
            customerOnly: true
        }
    },
    {
        path: '/player-desk',
        name: 'PlayerDesk',
        component: PlayerDesk,
        meta: {
            title: '打手工作台 - 三角洲行动俱乐部',
            requiresAuth: true,
            playerOnly: true
        }
    },
    {
        path: '/boss-desk',
        name: 'BossDesk',
        component: BossDesk,
        meta: {
            title: 'BOSS 控制台 - 三角洲行动俱乐部',
            requiresAuth: true,
            minUserLevel: 2
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
        path: '/orders/:id',
        name: 'OrderDetail',
        component: OrderDetail,
        meta: {
            title: '订单详情 - 三角洲行动俱乐部',
            requiresAuth: true
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
        path: '/game-map',
        name: 'GameMap',
        component: GameMap,
        meta: {
            title: '游戏地图 - 三角洲行动俱乐部',
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
];
// 创建路由实例
const router = createRouter({
    history: createWebHistory('/'), // 直接使用字符串
    routes
});
// 全局前置守卫 - 处理登录验证和页面标题
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    // 检查是否需要登录
    const requiresAuth = to.meta.requiresAuth;
    const isAuthenticated = !!getAuthToken();
    const isAuthPage = to.path === '/login' || to.path === '/register';
    if (requiresAuth && !isAuthenticated) {
        // 需要登录但未登录，重定向到登录页
        next({
            path: '/login',
            query: {
                redirect: to.fullPath
            }
        });
    }
    else if (requiresAuth && isAuthenticated) {
        // 已登录：按账号等级分流（0=顾客 / 1=打手）
        const level = getEffectiveUserLevel();
        if (to.meta.customerOnly && level !== 0) {
            next('/dashboard');
            return;
        }
        if (to.meta.playerOnly && level !== 1) {
            next('/dashboard');
            return;
        }
        if (to.meta.minUserLevel != null && level < to.meta.minUserLevel) {
            next('/dashboard');
            return;
        }
        next();
    }
    else if (isAuthPage && isAuthenticated) {
        // 已登录访问登录/注册页，优先回跳 redirect，其次首页（打手可回工作台）
        const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '';
        next(redirect || '/dashboard');
    }
    else {
        next();
    }
});
export default router;
