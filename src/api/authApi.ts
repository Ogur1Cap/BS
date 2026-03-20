import { apiRequest } from './apiClient'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      body: payload,
      auth: false
    })
  },

  async register(payload: RegisterRequest): Promise<{ ok: true }> {
    return apiRequest<{ ok: true }>({
      method: 'POST',
      path: '/auth/register',
      body: payload,
      auth: false
    })
  }
}

