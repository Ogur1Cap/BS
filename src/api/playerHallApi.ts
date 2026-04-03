import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

/** 后端返回的打手行（已包含 rank / rankText / skills 数组等） */
export type PlayerHallRow = Record<string, unknown>

export const playerHallApi = {
  async listPlayers(): Promise<PlayerHallRow[]> {
    return apiRequest<PlayerHallRow[]>({
      method: 'GET',
      path: API_ENDPOINTS.playerHall.players,
      auth: true
    })
  }
}
