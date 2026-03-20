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
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

