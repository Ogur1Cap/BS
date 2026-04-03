import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { MapMarkerDto } from '../types/gameMap'

/** 与 GameMap 页面 Poi 结构兼容的原始项 */
export type GameMapPoiRow = Record<string, unknown>

export const gameMapApi = {
  async listPois(): Promise<GameMapPoiRow[]> {
    return apiRequest<GameMapPoiRow[]>({
      method: 'GET',
      path: API_ENDPOINTS.gameMap.pois,
      auth: true
    })
  },

  async listMarkers(): Promise<MapMarkerDto[]> {
    return apiRequest<MapMarkerDto[]>({
      method: 'GET',
      path: API_ENDPOINTS.gameMap.markers,
      auth: true
    })
  },

  async addMarker(body: { x: number; y: number; label: string; note?: string }): Promise<MapMarkerDto[]> {
    return apiRequest<MapMarkerDto[]>({
      method: 'POST',
      path: API_ENDPOINTS.gameMap.markers,
      auth: true,
      body
    })
  },

  async updateMarker(
    markerId: string,
    body: { label?: string; note?: string; x?: number; y?: number }
  ): Promise<MapMarkerDto[]> {
    return apiRequest<MapMarkerDto[]>({
      method: 'PUT',
      path: API_ENDPOINTS.gameMap.marker(markerId),
      auth: true,
      body
    })
  },

  async deleteMarker(markerId: string): Promise<MapMarkerDto[]> {
    return apiRequest<MapMarkerDto[]>({
      method: 'DELETE',
      path: API_ENDPOINTS.gameMap.marker(markerId),
      auth: true
    })
  }
}
