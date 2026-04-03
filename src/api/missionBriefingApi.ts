import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { MissionBriefing } from '../types/missionBriefing'

export const missionBriefingApi = {
  async getToday(): Promise<MissionBriefing> {
    return apiRequest<MissionBriefing>({
      method: 'GET',
      path: API_ENDPOINTS.delta.missionBriefing,
      auth: true
    })
  }
}
