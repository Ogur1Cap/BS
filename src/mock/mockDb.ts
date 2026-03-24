import notificationsSeed from './data/notifications.json'
import ordersSeed from './data/orders.json'
import profileSeed from './data/profile.json'
import type { Notification } from '../types/notification'
import type { Order } from '../types/order'
import type { Profile } from '../types/profile'
import type { AccountSettings } from '../types/accountSettings'

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

// JSON 在 TS 中默认推断为 string/unions 不严格，这里显式断言到业务类型。
const notificationsSeedTyped = notificationsSeed as unknown as Notification[]
const ordersSeedTyped = ordersSeed as unknown as Order[]
const profileSeedTyped = profileSeed as unknown as Profile

let notifications = clone<Notification[]>(notificationsSeedTyped)
let orders = clone<Order[]>(ordersSeedTyped)
let profile = clone<Profile>(profileSeedTyped)

const initialSettings: AccountSettings = {
  nickname: '三角洲精英',
  bio: profileSeedTyped.bio || '',
  notifyChannels: 'app,email',
  notifyTypes: 'order,system,message,security',
  wechat: 'wx_demo_bound',
  qq: '',
  weibo: ''
}

let accountSettings = clone<AccountSettings>(initialSettings)

export const mockDb = {
  notification: {
    getAll(): Notification[] {
      return [...notifications]
    },
    markAsRead(notificationId: string): Notification[] {
      const idx = notifications.findIndex((n) => n.id === notificationId)
      if (idx !== -1) notifications[idx].isRead = true
      return [...notifications]
    },
    markAllAsRead(): Notification[] {
      notifications.forEach((n) => {
        n.isRead = true
      })
      return [...notifications]
    },
    deleteOne(notificationId: string): Notification[] {
      notifications = notifications.filter((n) => n.id !== notificationId)
      return [...notifications]
    }
  },

  orders: {
    list(): Order[] {
      return [...orders]
    },
    cancel(orderId: string): Order[] {
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx !== -1) {
        if (!['pending', 'ongoing'].includes(orders[idx].status)) return [...orders]
        orders[idx].status = 'cancelled'
        orders[idx].statusText = '已取消'
      }
      return [...orders]
    },
    create(payload: {
      gameKey: string
      game: string
      gameImage: string
      serviceType: string
      amount: number
      playerId?: string
      playerName?: string
    }): Order[] {
      const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`
      const next: Order = {
        id,
        game: payload.game,
        gameKey: payload.gameKey,
        gameImage: payload.gameImage,
        serviceType: payload.serviceType,
        status: 'pending',
        statusText: '待接单',
        amount: payload.amount,
        createdAt: new Date().toISOString(),
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        player: payload.playerId
          ? {
              id: payload.playerId,
              name: payload.playerName || '指定打手',
              avatar: 'https://picsum.photos/id/1005/40/40'
            }
          : null
      }
      orders = [next, ...orders]
      return [...orders]
    },
    detail(orderId: string): Order | null {
      return orders.find((item) => item.id === orderId) || null
    },
    reschedule(orderId: string, startTime: string): Order[] {
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx !== -1) {
        if (!['pending', 'ongoing'].includes(orders[idx].status)) return [...orders]
        orders[idx].startTime = startTime
        if (orders[idx].status === 'pending') {
          orders[idx].status = 'ongoing'
          orders[idx].statusText = '进行中'
        }
      }
      return [...orders]
    },
    refund(orderId: string, reason?: string): Order[] {
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx !== -1) {
        if (orders[idx].status === 'cancelled') return [...orders]
        orders[idx].status = 'cancelled'
        orders[idx].statusText = '已取消'
        orders[idx].refundRequested = true
        orders[idx].refundReason = reason || '用户申请退款'
      }
      return [...orders]
    }
  },

  profile: {
    get(): Profile {
      return { ...profile }
    },
    update(payload: Partial<Profile>): Profile {
      profile = {
        ...profile,
        ...payload
      }
      if (payload.bio !== undefined) {
        accountSettings = { ...accountSettings, bio: profile.bio }
      }
      return { ...profile }
    },
    applyLoginUser(username: string): Profile {
      // 简化：根据登录的用户名更新个人资料展示字段
      const safeUsername = username.trim()
      profile = {
        ...profile,
        username: safeUsername,
        email: `user_${safeUsername.replace(/\s+/g, '').toLowerCase()}@example.com`
      }
      return { ...profile }
    }
  },

  accountSettings: {
    get(): AccountSettings {
      return { ...accountSettings, bio: profile.bio }
    },
    update(payload: Partial<AccountSettings>): AccountSettings {
      accountSettings = { ...accountSettings, ...payload }
      if (payload.bio !== undefined) {
        profile = { ...profile, bio: payload.bio }
      }
      return { ...accountSettings, bio: profile.bio }
    }
  }
}

