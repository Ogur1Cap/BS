import { notificationsApi } from '../api/notificationsApi';
// 通知服务
export const notificationService = {
    // 获取所有通知
    async getNotifications() {
        return notificationsApi.getNotifications();
    },
    // 获取未读通知数量
    async getUnreadCount() {
        const notifications = await this.getNotifications();
        return notifications.filter(notification => !notification.isRead).length;
    },
    // 标记通知为已读
    async markAsRead(notificationId) {
        return notificationsApi.markAsRead(notificationId);
    },
    // 删除通知
    async deleteNotification(notificationId) {
        return notificationsApi.deleteNotification(notificationId);
    },
    // 标记所有通知为已读
    async markAllAsRead() {
        return notificationsApi.markAllAsRead();
    }
};
