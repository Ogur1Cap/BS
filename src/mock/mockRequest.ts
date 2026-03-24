import type { ApiRequestOptions } from '../api/request'
import { mockDb } from './mockDb'
import type { LoginResponse } from '../types/auth'
import type { Profile } from '../types/profile'
import type { AccountSettings } from '../types/accountSettings'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assertBody<T>(body: unknown): T {
  return body as T
}

export async function mockRequest<T>(options: ApiRequestOptions): Promise<T> {
  // 统一延迟，模拟真实网络
  await sleep(300)

  const { method, path } = options

  // auth
  if (method === 'POST' && path === '/auth/login') {
    const { username } = assertBody<{ username: string; password: string }>(options.body)
    const updatedProfile = mockDb.profile.applyLoginUser(username)
    const res: LoginResponse = {
      token: `delta_action_mock_token_${Date.now()}`,
      user: {
        username: updatedProfile.username,
        avatar: updatedProfile.avatar,
        email: updatedProfile.email,
        phone: updatedProfile.phone
      }
    }
    return res as T
  }

  if (method === 'POST' && path === '/auth/register') {
    const { username, email } = assertBody<{ username: string; email: string; password: string }>(options.body)
    mockDb.profile.update({
      username: username.trim(),
      email: email.trim()
    })
    return { ok: true } as T
  }

  // notifications
  if (method === 'GET' && path === '/notifications') {
    const res = mockDb.notification.getAll()
    return res as unknown as T
  }

  if (method === 'POST' && path === '/notifications/mark-read') {
    const { notificationId } = assertBody<{ notificationId: string }>(options.body)
    const res = mockDb.notification.markAsRead(notificationId)
    return res as unknown as T
  }

  if (method === 'POST' && path === '/notifications/mark-all-read') {
    const res = mockDb.notification.markAllAsRead()
    return res as unknown as T
  }

  if (method === 'DELETE' && path.startsWith('/notifications/')) {
    const id = decodeURIComponent(path.split('/')[2] || '')
    const res = mockDb.notification.deleteOne(id)
    return res as unknown as T
  }

  // orders
  if (method === 'GET' && path === '/orders') {
    const res = mockDb.orders.list()
    return res as unknown as T
  }

  if (method === 'POST' && path === '/orders') {
    const payload = assertBody<{
      gameKey: string
      game: string
      gameImage: string
      serviceType: string
      amount: number
      playerId?: string
      playerName?: string
    }>(options.body)
    const res = mockDb.orders.create(payload)
    return res as unknown as T
  }

  if (method === 'POST' && path.endsWith('/cancel') && path.startsWith('/orders/')) {
    const orderId = decodeURIComponent(path.split('/')[2] || '')
    const res = mockDb.orders.cancel(orderId)
    return res as unknown as T
  }

  if (method === 'GET' && path.startsWith('/orders/')) {
    const orderId = decodeURIComponent(path.split('/')[2] || '')
    const res = mockDb.orders.detail(orderId)
    if (!res) throw new Error(`Order not found: ${orderId}`)
    return res as unknown as T
  }

  if (method === 'POST' && path.endsWith('/reschedule') && path.startsWith('/orders/')) {
    const orderId = decodeURIComponent(path.split('/')[2] || '')
    const body = assertBody<{ startTime: string }>(options.body)
    const res = mockDb.orders.reschedule(orderId, body.startTime)
    return res as unknown as T
  }

  if (method === 'POST' && path.endsWith('/refund') && path.startsWith('/orders/')) {
    const orderId = decodeURIComponent(path.split('/')[2] || '')
    const body = assertBody<{ reason?: string }>(options.body)
    const res = mockDb.orders.refund(orderId, body.reason)
    return res as unknown as T
  }

  // profile
  if (method === 'GET' && path === '/profile') {
    const res = mockDb.profile.get()
    return res as unknown as T
  }

  if (method === 'PUT' && path === '/profile') {
    const payload = assertBody<Partial<Profile>>(options.body)
    const res = mockDb.profile.update(payload)
    return res as unknown as T
  }

  if (method === 'POST' && path === '/profile/avatar-data') {
    const { dataUrl } = assertBody<{ dataUrl: string }>(options.body)
    mockDb.profile.update({ avatar: dataUrl })
    return { url: dataUrl } as T
  }

  if (method === 'POST' && path === '/profile/change-password') {
    assertBody<{ currentPassword: string; newPassword: string }>(options.body)
    return undefined as T
  }

  if (method === 'GET' && path === '/account-settings') {
    return mockDb.accountSettings.get() as unknown as T
  }

  if (method === 'PUT' && path === '/account-settings') {
    const payload = assertBody<Partial<AccountSettings>>(options.body)
    const res = mockDb.accountSettings.update(payload)
    return res as unknown as T
  }

  // 如果未匹配到 mock 路由，直接抛错，方便你继续补齐接口
  throw new Error(`Mock: no handler for ${method} ${path}`)
}

