export type StoredUser = {
  username?: string
  /** 展示用昵称（来自账户设置） */
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
}

const TOKEN_KEY = 'delta_token'
const USER_KEY = 'delta_user'

function readFromStorages(key: string): string {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || ''
}

function writeToStorage(key: string, value: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem(key, value)
    sessionStorage.removeItem(key)
    return
  }
  sessionStorage.setItem(key, value)
  localStorage.removeItem(key)
}

export function getAuthToken(): string {
  return readFromStorages(TOKEN_KEY)
}

export function setAuthToken(token: string, remember: boolean): void {
  writeToStorage(TOKEN_KEY, token, remember)
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getAuthUser(): StoredUser | null {
  const userStr = readFromStorages(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as StoredUser
  } catch {
    return null
  }
}

export function setAuthUser(user: StoredUser, remember: boolean): void {
  writeToStorage(USER_KEY, JSON.stringify(user), remember)
}

export function removeAuthUser(): void {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}

