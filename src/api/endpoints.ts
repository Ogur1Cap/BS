export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register'
  },
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (orderId: string) => `/orders/${encodeURIComponent(orderId)}`,
    reschedule: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/reschedule`,
    refund: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/refund`,
    cancel: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/cancel`
  },
  profile: {
    detail: '/profile',
    avatar: '/profile/avatar',
    /** Mock 模式：Base64 传图 */
    avatarData: '/profile/avatar-data',
    changePassword: '/profile/change-password'
  },
  accountSettings: {
    root: '/account-settings'
  },
  notifications: {
    list: '/notifications',
    markRead: '/notifications/mark-read',
    markAllRead: '/notifications/mark-all-read',
    detail: (notificationId: string) => `/notifications/${encodeURIComponent(notificationId)}`
  }
} as const
