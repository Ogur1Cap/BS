import { apiRequest } from './apiClient'
import type { Profile } from '../types/profile'

export const profileApi = {
  async getProfile(): Promise<Profile> {
    return apiRequest<Profile>({ method: 'GET', path: '/profile', auth: true })
  },

  async updateProfile(payload: Partial<Profile>): Promise<Profile> {
    return apiRequest<Profile>({
      method: 'PUT',
      path: '/profile',
      auth: true,
      body: payload
    })
  }
}

