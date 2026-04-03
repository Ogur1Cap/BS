import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { Notification } from '../types/notification'

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>({ method: 'GET', path: API_ENDPOINTS.notifications.list, auth: true })
  },

  /** 仅拉取未读数量（顶栏角标轮询） */
  async getUnreadCount(): Promise<number> {
    const data = await apiRequest<{ count: number }>({
      method: 'GET',
      path: API_ENDPOINTS.notifications.unreadCount,
      auth: true
    })
    return typeof data.count === 'number' ? data.count : 0
  },

  async markAsRead(notificationId: string): Promise<Notification[]> {
    return apiRequest<Notification[]>({
      method: 'POST',
      path: API_ENDPOINTS.notifications.markRead,
      auth: true,
      body: { notificationId }
    })
  },

  async markAllAsRead(): Promise<Notification[]> {
    return apiRequest<Notification[]>({ method: 'POST', path: API_ENDPOINTS.notifications.markAllRead, auth: true })
  },

  async deleteNotification(notificationId: string): Promise<Notification[]> {
    return apiRequest<Notification[]>({
      method: 'DELETE',
      path: API_ENDPOINTS.notifications.detail(notificationId),
      auth: true
    })
  }
}

