import notificationsSeed from './data/notifications.json'
import ordersSeed from './data/orders.json'
import profileSeed from './data/profile.json'
import type { Notification } from '../types/notification'
import type { Order } from '../types/order'
import type { Profile } from '../types/profile'

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
        orders[idx].status = 'cancelled'
        orders[idx].statusText = '已取消'
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
  }
}

