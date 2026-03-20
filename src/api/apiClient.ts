import { isMockMode } from './apiMode'
import { getAuthToken } from './token'
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
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''

  const url = new URL(path, baseUrl || window.location.origin)

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
    throw new ApiError('Request failed', res.status, data)
  }

  return data as T
}

