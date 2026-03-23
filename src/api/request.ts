import { isMockMode } from './apiMode'
import { getAuthToken, removeAuthToken, removeAuthUser } from './token'
import { mockRequest } from '../mock/mockRequest'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiRequestOptions {
  method: HttpMethod
  path: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  code?: string | number
  data: unknown

  constructor(message: string, status: number, data: unknown, code?: string | number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

// 统一域名入口：后续接入后端只需改 VITE_API_BASE_URL。
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || ''

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

type WrappedApiResponse<T> = {
  code?: string | number
  message?: string
  data?: T
}

function isWrappedResponse<T>(value: unknown): value is WrappedApiResponse<T> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return 'code' in value || 'message' in value || 'data' in value
}

function isBusinessSuccessCode(code: unknown): boolean {
  return code === 0 || code === 200 || code === '0' || code === '200'
}

function buildRedirectLoginUrl(): string {
  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return `/login?redirect=${encodeURIComponent(redirect)}`
}

function handleUnauthorized(): void {
  removeAuthToken()
  removeAuthUser()
  if (window.location.pathname !== '/login') {
    window.location.replace(buildRedirectLoginUrl())
  }
}

function unwrapResponseData<T>(payload: unknown, status: number): T {
  if (!isWrappedResponse<T>(payload)) {
    return payload as T
  }

  const responseCode = payload.code
  const responseMessage = payload.message || '请求失败'

  if (responseCode === undefined || responseCode === null || isBusinessSuccessCode(responseCode)) {
    return payload.data as T
  }

  throw new ApiError(responseMessage, status, payload, responseCode)
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const url = new URL(path, getApiBaseUrl() || window.location.origin)

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue
      url.searchParams.set(k, String(v))
    }
  }

  return url.toString()
}

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  if (isMockMode()) {
    return mockRequest<T>(options)
  }

  const url = buildUrl(options.path, options.query)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (options.auth) {
    const token = getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  })

  const text = await res.text()
  const data = text ? (() => {
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  })() : null

  if (!res.ok) {
    const backendMessage = (
      data && typeof data === 'object' && 'message' in data
        ? (data as { message?: unknown }).message
        : undefined
    )
    const errorMessage = typeof backendMessage === 'string' && backendMessage.trim()
      ? backendMessage
      : 'Request failed'

    if (res.status === 401) {
      handleUnauthorized()
    }
    throw new ApiError(errorMessage, res.status, data)
  }

  const unwrapped = unwrapResponseData<T>(data, res.status)
  return unwrapped
}
