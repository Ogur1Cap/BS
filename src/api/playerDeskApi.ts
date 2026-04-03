import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

/** 与后端打手工作台订单 DTO 对齐（含顾客用户名） */
export type PlayerDeskOrder = Record<string, unknown>

export interface PlayerDeskStats {
  pendingCount: number
  servingCount: number
  completedWeekCount: number
  playerProfileId: string
  displayHint: string
}

export const playerDeskApi = {
  async getStats(): Promise<PlayerDeskStats> {
    return apiRequest<PlayerDeskStats>({
      method: 'GET',
      path: API_ENDPOINTS.playerDesk.stats,
      auth: true
    })
  },

  async listPending(): Promise<PlayerDeskOrder[]> {
    return apiRequest<PlayerDeskOrder[]>({
      method: 'GET',
      path: API_ENDPOINTS.playerDesk.pendingOrders,
      auth: true
    })
  },

  async listServing(): Promise<PlayerDeskOrder[]> {
    return apiRequest<PlayerDeskOrder[]>({
      method: 'GET',
      path: API_ENDPOINTS.playerDesk.servingOrders,
      auth: true
    })
  },

  async acceptOrder(orderId: string): Promise<PlayerDeskOrder[]> {
    return apiRequest<PlayerDeskOrder[]>({
      method: 'POST',
      path: API_ENDPOINTS.playerDesk.accept(orderId),
      auth: true
    })
  },

  async rejectOrder(orderId: string, reason?: string): Promise<PlayerDeskOrder[]> {
    return apiRequest<PlayerDeskOrder[]>({
      method: 'POST',
      path: API_ENDPOINTS.playerDesk.reject(orderId),
      auth: true,
      body: reason ? { reason } : {}
    })
  },

  /** 申请订单完成（进入待 BOSS 审核） */
  async requestOrderComplete(orderId: string, note?: string): Promise<PlayerDeskOrder[]> {
    return apiRequest<PlayerDeskOrder[]>({
      method: 'POST',
      path: API_ENDPOINTS.playerDesk.completeRequest(orderId),
      auth: true,
      body: note ? { note } : {}
    })
  }
}
