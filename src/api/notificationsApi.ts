import { apiRequest } from './apiClient'
import type { Notification } from '../types/notification'

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>({ method: 'GET', path: '/notifications', auth: true })
  },

  async markAsRead(notificationId: string): Promise<Notification[]> {
    return apiRequest<Notification[]>({
      method: 'POST',
      path: '/notifications/mark-read',
      auth: true,
      body: { notificationId }
    })
  },

  async markAllAsRead(): Promise<Notification[]> {
    return apiRequest<Notification[]>({ method: 'POST', path: '/notifications/mark-all-read', auth: true })
  },

  async deleteNotification(notificationId: string): Promise<Notification[]> {
    return apiRequest<Notification[]>({
      method: 'DELETE',
      path: `/notifications/${encodeURIComponent(notificationId)}`,
      auth: true
    })
  }
}

