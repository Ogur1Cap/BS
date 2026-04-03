import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

export type BossDeskOrder = Record<string, unknown>

export interface BossDeskStats {
  pendingCompletionCount: number
  manageableOrderCount: number
  pendingJoinCount?: number
  displayHint: string
}

export interface BossPlayerOption {
  id: number
  name: string
  avatar?: string
}

export type BossJoinApplication = Record<string, unknown>

export interface BossPlayerAccountRow {
  userId: string
  username: string
  email: string
  playerProfileId: string | null
  playerName: string
}

export const bossDeskApi = {
  async getStats(): Promise<BossDeskStats> {
    return apiRequest<BossDeskStats>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.stats,
      auth: true
    })
  },

  async listCompletionPending(): Promise<BossDeskOrder[]> {
    return apiRequest<BossDeskOrder[]>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.completionPending,
      auth: true
    })
  },

  async listManageable(): Promise<BossDeskOrder[]> {
    return apiRequest<BossDeskOrder[]>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.manageable,
      auth: true
    })
  },

  async listPlayers(): Promise<BossPlayerOption[]> {
    return apiRequest<BossPlayerOption[]>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.players,
      auth: true
    })
  },

  async approveCompletion(orderId: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.approveCompletion(orderId),
      auth: true
    })
  },

  async rejectCompletion(orderId: string, reason?: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.rejectCompletion(orderId),
      auth: true,
      body: reason ? { reason } : {}
    })
  },

  async reassignOrder(orderId: string, targetPlayerId: number, remark: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.reassign(orderId),
      auth: true,
      body: { targetPlayerId, remark }
    })
  },

  async listJoinPending(): Promise<BossJoinApplication[]> {
    return apiRequest<BossJoinApplication[]>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.joinPending,
      auth: true
    })
  },

  async approveJoin(applicationId: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.joinApprove(applicationId),
      auth: true
    })
  },

  async rejectJoin(applicationId: string, reason?: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.joinReject(applicationId),
      auth: true,
      body: reason ? { reason } : {}
    })
  },

  async listPlayerAccounts(): Promise<BossPlayerAccountRow[]> {
    return apiRequest<BossPlayerAccountRow[]>({
      method: 'GET',
      path: API_ENDPOINTS.bossDesk.playerAccounts,
      auth: true
    })
  },

  async revokePlayer(userId: string): Promise<void> {
    await apiRequest<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.bossDesk.revokePlayer(userId),
      auth: true
    })
  }
}
