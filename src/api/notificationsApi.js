import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const notificationsApi = {
    async getNotifications() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.notifications.list, auth: true });
    },
    /** 仅拉取未读数量（顶栏角标轮询） */
    async getUnreadCount() {
        const data = await apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.notifications.unreadCount,
            auth: true
        });
        return typeof data.count === 'number' ? data.count : 0;
    },
    async markAsRead(notificationId) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.notifications.markRead,
            auth: true,
            body: { notificationId }
        });
    },
    async markAllAsRead() {
        return apiRequest({ method: 'POST', path: API_ENDPOINTS.notifications.markAllRead, auth: true });
    },
    async deleteNotification(notificationId) {
        return apiRequest({
            method: 'DELETE',
            path: API_ENDPOINTS.notifications.detail(notificationId),
            auth: true
        });
    }
};
