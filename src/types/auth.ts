export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthUser {
  username: string
  avatar?: string
  email?: string
  phone?: string
  /** 0=顾客 1=打手 */
  userLevel?: number
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

