import { apiRequest } from './apiClient';
export const notificationsApi = {
    async getNotifications() {
        return apiRequest({ method: 'GET', path: '/notifications', auth: true });
    },
    async markAsRead(notificationId) {
        return apiRequest({
            method: 'POST',
            path: '/notifications/mark-read',
            auth: true,
            body: { notificationId }
        });
    },
    async markAllAsRead() {
        return apiRequest({ method: 'POST', path: '/notifications/mark-all-read', auth: true });
    },
    async deleteNotification(notificationId) {
        return apiRequest({
            method: 'DELETE',
            path: `/notifications/${encodeURIComponent(notificationId)}`,
            auth: true
        });
    }
};
