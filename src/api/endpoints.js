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
        detail: (notificationId) => `/notifications/${encodeURIComponent(notificationId)}`
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
        marker: (markerId) => `/game-map/markers/${encodeURIComponent(markerId)}`
    },
    delta: {
        missionBriefing: '/delta/mission-briefing'
    },
    playerDesk: {
        stats: '/player-desk/stats',
        pendingOrders: '/player-desk/orders/pending',
        servingOrders: '/player-desk/orders/serving',
        accept: (orderId) => `/player-desk/orders/${encodeURIComponent(orderId)}/accept`,
        reject: (orderId) => `/player-desk/orders/${encodeURIComponent(orderId)}/reject`,
        completeRequest: (orderId) => `/player-desk/orders/${encodeURIComponent(orderId)}/complete-request`
    },
    bossDesk: {
        stats: '/boss-desk/stats',
        completionPending: '/boss-desk/orders/completion-pending',
        manageable: '/boss-desk/orders/manageable',
        players: '/boss-desk/players',
        approveCompletion: (orderId) => `/boss-desk/orders/${encodeURIComponent(orderId)}/completion/approve`,
        rejectCompletion: (orderId) => `/boss-desk/orders/${encodeURIComponent(orderId)}/completion/reject`,
        reassign: (orderId) => `/boss-desk/orders/${encodeURIComponent(orderId)}/reassign`,
        joinPending: '/boss-desk/join-applications/pending',
        joinApprove: (applicationId) => `/boss-desk/join-applications/${encodeURIComponent(applicationId)}/approve`,
        joinReject: (applicationId) => `/boss-desk/join-applications/${encodeURIComponent(applicationId)}/reject`,
        playerAccounts: '/boss-desk/player-accounts',
        revokePlayer: (userId) => `/boss-desk/player-accounts/${encodeURIComponent(userId)}/revoke`
    },
    playerJoin: {
        submit: '/player-join-applications',
        me: '/player-join-applications/me'
    }
};
