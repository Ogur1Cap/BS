import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { CreateOrderPayload, Order, RefundOrderPayload, RescheduleOrderPayload } from '../types/order'

export const ordersApi = {
  async listOrders(): Promise<Order[]> {
    return apiRequest<Order[]>({ method: 'GET', path: API_ENDPOINTS.orders.list, auth: true })
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order[]> {
    return apiRequest<Order[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.create,
      auth: true,
      body: payload
    })
  },

  async getOrderDetail(orderId: string): Promise<Order> {
    return apiRequest<Order>({
      method: 'GET',
      path: API_ENDPOINTS.orders.detail(orderId),
      auth: true
    })
  },

  async rescheduleOrder(payload: RescheduleOrderPayload): Promise<Order[]> {
    return apiRequest<Order[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.reschedule(payload.orderId),
      auth: true,
      body: payload
    })
  },

  async refundOrder(payload: RefundOrderPayload): Promise<Order[]> {
    return apiRequest<Order[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.refund(payload.orderId),
      auth: true,
      body: payload
    })
  },

  async cancelOrder(orderId: string): Promise<Order[]> {
    return apiRequest<Order[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.cancel(orderId),
      auth: true,
      body: { orderId }
    })
  }
}

