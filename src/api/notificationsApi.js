import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const notificationsApi = {
    async getNotifications() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.notifications.list, auth: true });
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
