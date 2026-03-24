import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { AccountSettings } from '../types/accountSettings'

export const accountSettingsApi = {
  async get(): Promise<AccountSettings> {
    return apiRequest<AccountSettings>({ method: 'GET', path: API_ENDPOINTS.accountSettings.root, auth: true })
  },

  async update(payload: Partial<AccountSettings>): Promise<AccountSettings> {
    return apiRequest<AccountSettings>({
      method: 'PUT',
      path: API_ENDPOINTS.accountSettings.root,
      auth: true,
      body: payload
    })
  }
}
