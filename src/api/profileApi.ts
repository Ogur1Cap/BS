import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { Profile } from '../types/profile'

export const profileApi = {
  async getProfile(): Promise<Profile> {
    return apiRequest<Profile>({ method: 'GET', path: API_ENDPOINTS.profile.detail, auth: true })
  },

  async updateProfile(payload: Partial<Profile>): Promise<Profile> {
    return apiRequest<Profile>({
      method: 'PUT',
      path: API_ENDPOINTS.profile.detail,
      auth: true,
      body: payload
    })
  }
}

