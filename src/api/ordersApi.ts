import { apiRequest } from './apiClient'
import type { Order } from '../types/order'

export const ordersApi = {
  async listOrders(): Promise<Order[]> {
    return apiRequest<Order[]>({ method: 'GET', path: '/orders', auth: true })
  },

  async cancelOrder(orderId: string): Promise<Order[]> {
    return apiRequest<Order[]>({
      method: 'POST',
      path: `/orders/${encodeURIComponent(orderId)}/cancel`,
      auth: true,
      body: { orderId }
    })
  }
}

