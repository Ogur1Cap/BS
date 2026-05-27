import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { OverviewStats, StatusCount, UserLevelCount } from '../types/statistics'

export const statisticsApi = {
  async getOverview(): Promise<OverviewStats> {
    return apiRequest<OverviewStats>({
      method: 'GET',
      path: API_ENDPOINTS.statistics.overview,
      auth: true
    })
  },

  async getOrdersByStatus(): Promise<StatusCount[]> {
    return apiRequest<StatusCount[]>({
      method: 'GET',
      path: API_ENDPOINTS.statistics.ordersByStatus,
      auth: true
    })
  },

  async getUsersByLevel(): Promise<UserLevelCount[]> {
    return apiRequest<UserLevelCount[]>({
      method: 'GET',
      path: API_ENDPOINTS.statistics.usersByLevel,
      auth: true
    })
  }
}
