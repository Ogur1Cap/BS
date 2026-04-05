import type { Notification } from '../types/notification';

import { notificationsApi } from '../api/notificationsApi';

// 通知服务
export const notificationService = {
  // 获取所有通知
  async getNotifications(): Promise<Notification[]> {
    return notificationsApi.getNotifications();
  },
  
  // 获取未读通知数量（优先走轻量接口）
  async getUnreadCount(): Promise<number> {
    return notificationsApi.getUnreadCount();
  },
  
  // 标记通知为已读
  async markAsRead(notificationId: string): Promise<Notification[]> {
    return notificationsApi.markAsRead(notificationId);
  },
  
  // 删除通知
  async deleteNotification(notificationId: string): Promise<Notification[]> {
    return notificationsApi.deleteNotification(notificationId);
  },
  
  // 标记所有通知为已读
  async markAllAsRead(): Promise<Notification[]> {
    return notificationsApi.markAllAsRead();
  }
};
