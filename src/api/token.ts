export type StoredUser = { username?: string; avatar?: string; email?: string }

export function getAuthToken(): string {
  return localStorage.getItem('delta_token') || sessionStorage.getItem('delta_token') || ''
}

export function getAuthUser(): StoredUser | null {
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as StoredUser
  } catch {
    return null
  }
}

