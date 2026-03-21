import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { Notification } from '../types/notification'

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>({ method: 'GET', path: API_ENDPOINTS.notifications.list, auth: true })
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

