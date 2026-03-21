export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register'
    },
    orders: {
        list: '/orders',
        create: '/orders',
        detail: (orderId) => `/orders/${encodeURIComponent(orderId)}`,
        reschedule: (orderId) => `/orders/${encodeURIComponent(orderId)}/reschedule`,
        refund: (orderId) => `/orders/${encodeURIComponent(orderId)}/refund`,
        cancel: (orderId) => `/orders/${encodeURIComponent(orderId)}/cancel`
    },
    profile: {
        detail: '/profile'
    },
    notifications: {
        list: '/notifications',
        markRead: '/notifications/mark-read',
        markAllRead: '/notifications/mark-all-read',
        detail: (notificationId) => `/notifications/${encodeURIComponent(notificationId)}`
    }
};
