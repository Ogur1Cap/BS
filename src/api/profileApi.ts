import { apiRequest, ApiError, getApiBaseUrl } from './request'
import { API_ENDPOINTS } from './endpoints'
import { isMockMode } from './apiMode'
import { getAuthToken } from './token'
import type { Profile } from '../types/profile'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

function unwrapData<T>(data: unknown, status: number): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data as T
  }
  const o = data as { code?: unknown; message?: string; data?: unknown }
  const c = o.code
  if (c !== undefined && c !== null && c !== 0 && c !== 200 && c !== '0' && c !== '200') {
    throw new ApiError(o.message || '请求失败', status, data, c as string | number)
  }
  return o.data as T
}

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
  },

  /** 上传头像：真实环境 multipart；Mock 走 Base64 JSON 接口 */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    if (isMockMode()) {
      const dataUrl = await readFileAsDataUrl(file)
      return apiRequest<{ url: string }>({
        method: 'POST',
        path: API_ENDPOINTS.profile.avatarData,
        body: { dataUrl },
        auth: true
      })
    }

    const base = getApiBaseUrl().replace(/\/$/, '')
    const token = getAuthToken()
    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch(`${base}${API_ENDPOINTS.profile.avatar}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    })

    const text = await res.text()
    const parsed = text ? (JSON.parse(text) as unknown) : null

    if (!res.ok) {
      const msg =
        parsed && typeof parsed === 'object' && 'message' in parsed
          ? String((parsed as { message?: unknown }).message || '')
          : ''
      throw new ApiError(msg || '上传失败', res.status, parsed)
    }

    return unwrapData<{ url: string }>(parsed, res.status)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiRequest<void>({
      method: 'POST',
      path: API_ENDPOINTS.profile.changePassword,
      auth: true,
      body: { currentPassword, newPassword }
    })
  }
}
