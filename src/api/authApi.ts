import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>({
      method: 'POST',
      path: API_ENDPOINTS.auth.login,
      body: payload,
      auth: false
    })
  },

  async register(payload: RegisterRequest): Promise<{ ok: true }> {
    return apiRequest<{ ok: true }>({
      method: 'POST',
      path: API_ENDPOINTS.auth.register,
      body: payload,
      auth: false
    })
  }
}

