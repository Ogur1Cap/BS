export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
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
    unreadCount: '/notifications/unread-count',
    markRead: '/notifications/mark-read',
    markAllRead: '/notifications/mark-all-read',
    detail: (notificationId: string) => `/notifications/${encodeURIComponent(notificationId)}`
  },
  helpCenter: {
    faqs: '/help-center/faqs'
  },
  supportCenter: {
    tickets: '/support-center/tickets'
  },
  playerHall: {
    players: '/player-hall/players'
  },
  gameMap: {
    pois: '/game-map/pois',
    markers: '/game-map/markers',
    marker: (markerId: string) => `/game-map/markers/${encodeURIComponent(markerId)}`
  },
  delta: {
    missionBriefing: '/delta/mission-briefing'
  },
  playerDesk: {
    stats: '/player-desk/stats',
    pendingOrders: '/player-desk/orders/pending',
    servingOrders: '/player-desk/orders/serving',
    accept: (orderId: string) => `/player-desk/orders/${encodeURIComponent(orderId)}/accept`,
    reject: (orderId: string) => `/player-desk/orders/${encodeURIComponent(orderId)}/reject`,
    completeRequest: (orderId: string) =>
      `/player-desk/orders/${encodeURIComponent(orderId)}/complete-request`
  },
  bossDesk: {
    stats: '/boss-desk/stats',
    completionPending: '/boss-desk/orders/completion-pending',
    manageable: '/boss-desk/orders/manageable',
    players: '/boss-desk/players',
    approveCompletion: (orderId: string) =>
      `/boss-desk/orders/${encodeURIComponent(orderId)}/completion/approve`,
    rejectCompletion: (orderId: string) =>
      `/boss-desk/orders/${encodeURIComponent(orderId)}/completion/reject`,
    reassign: (orderId: string) => `/boss-desk/orders/${encodeURIComponent(orderId)}/reassign`,
    joinPending: '/boss-desk/join-applications/pending',
    joinApprove: (applicationId: string) =>
      `/boss-desk/join-applications/${encodeURIComponent(applicationId)}/approve`,
    joinReject: (applicationId: string) =>
      `/boss-desk/join-applications/${encodeURIComponent(applicationId)}/reject`,
    playerAccounts: '/boss-desk/player-accounts',
    revokePlayer: (userId: string) =>
      `/boss-desk/player-accounts/${encodeURIComponent(userId)}/revoke`,
    refundPending: '/boss-desk/orders/refund-pending',
    processRefund: (orderId: string) =>
      `/boss-desk/orders/${encodeURIComponent(orderId)}/refund/process`
  },
  playerJoin: {
    submit: '/player-join-applications',
    me: '/player-join-applications/me'
  },
  violation: {
    my: '/api/violation/my',
    appeal: (violationId: string) => `/api/violation/appeal/${encodeURIComponent(violationId)}`,
    bossPending: '/api/violation/boss/pending',
    bossAppealed: '/api/violation/boss/appealed',
    bossAll: '/api/violation/boss/all',
    bossHandle: (violationId: string) => `/api/violation/boss/handle/${encodeURIComponent(violationId)}`
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    detail: (id: number) => `/transactions/${id}`,
    delete: (id: number) => `/transactions/${id}`,
    summary: '/transactions/summary',
    daily: '/transactions/daily'
  },
  statistics: {
    overview: '/statistics/overview',
    ordersByStatus: '/statistics/orders-by-status',
    usersByLevel: '/statistics/users-by-level'
  },
  wallet: {
    info: '/wallet',
    recharge: '/wallet/recharge',
    adminAdjust: '/wallet/admin/adjust'
  }
} as const
