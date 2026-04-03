import notificationsSeed from './data/notifications.json'
import ordersSeed from './data/orders.json'
import profileSeed from './data/profile.json'
import type { Notification } from '../types/notification'
import { normalizePlayerProfileId } from '../utils/playerProfileId'
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
/** Mock 权限：0 顾客 / 1 打手（登录时按用户名切换） */
let mockUserLevel = 0
let mockPlayerProfileId: string | null = null

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

/** Mock：入驻申请与审核通过后追加到大厅的打手 */
export type MockJoinAppStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface MockJoinApplication {
  id: string
  applicantUsername: string
  displayName: string
  intro: string
  skills: string
  rankName: string
  tags: string
  pricePerHour: number
  contactNote: string
  status: MockJoinAppStatus
  createdAt: string
  rejectReason?: string
}

let joinApplications: MockJoinApplication[] = []
let joinExtraHallPlayers: Record<string, unknown>[] = []
const mockRevokedPlayerUsernames = new Set<string>()

export const mockDb = {
  notification: {
    /** Mock：仅打手账号可见的新订单提醒（顾客登录时不展示） */
    pushPlayerOnlyOrder(title: string, content: string, relatedId: string) {
      const n: Notification = {
        id: `notif-p-${Date.now()}`,
        title,
        content,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId,
        visibleFor: 'player'
      }
      notifications = [n, ...notifications]
    },
    getAll(): Notification[] {
      const lvl = mockUserLevel
      return notifications.filter((n) => {
        const v = n.visibleFor
        if (v == null || v === 'all') return true
        if (v === 'player') return lvl >= 1
        if (v === 'customer') return lvl === 0
        return true
      })
    },
    markAsRead(notificationId: string): Notification[] {
      const idx = notifications.findIndex((n) => n.id === notificationId)
      if (idx !== -1) notifications[idx].isRead = true
      // 与 GET /notifications 一致，按当前登录角色过滤 visibleFor
      return mockDb.notification.getAll()
    },
    markAllAsRead(): Notification[] {
      notifications.forEach((n) => {
        n.isRead = true
      })
      return mockDb.notification.getAll()
    },
    deleteOne(notificationId: string): Notification[] {
      notifications = notifications.filter((n) => n.id !== notificationId)
      return mockDb.notification.getAll()
    },
    unreadCount(): number {
      return mockDb.notification.getAll().filter((n) => !n.isRead).length
    }
  },

  orders: {
    list(): Order[] {
      return [...orders]
    },
    cancel(orderId: string): Order[] {
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx !== -1) {
        if (!['pending', 'ongoing', 'completion_pending'].includes(orders[idx].status)) return [...orders]
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
      const npid = normalizePlayerProfileId(payload.playerId)
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
        player: npid
          ? {
              id: npid,
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
        if (!['pending', 'ongoing', 'completion_pending'].includes(orders[idx].status)) return [...orders]
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
    getUserLevel(): number {
      return mockUserLevel
    },
    get(): Profile {
      return {
        ...profile,
        userLevel: mockUserLevel,
        playerProfileId: mockPlayerProfileId
      }
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
      const key = safeUsername.toLowerCase()
      // 打手演示：用户名或邮箱均可识别（与真实后端「用户名或邮箱登录」一致）
      const isBoss =
        key === 'boss_delta' || key === 'boss@demo.delta' || safeUsername === 'BOSS_Delta'
      const isPlayerDesk =
        key === 'dashou_yexi' || key === 'dashou_yexi@demo.delta' || safeUsername === 'DaShou_YeXi'
      mockUserLevel = isBoss ? 2 : isPlayerDesk ? 1 : 0
      mockPlayerProfileId = isBoss ? null : isPlayerDesk ? '2' : null
      profile = {
        ...profile,
        username: isBoss ? 'BOSS_Delta' : isPlayerDesk ? 'DaShou_YeXi' : safeUsername,
        email: isBoss
          ? 'boss@demo.delta'
          : isPlayerDesk
            ? 'dashou_yexi@demo.delta'
            : `user_${safeUsername.replace(/\s+/g, '').toLowerCase()}@example.com`
      }
      return mockDb.profile.get()
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
  },

  joinUs: {
    hallExtras(): Record<string, unknown>[] {
      return [...joinExtraHallPlayers]
    },
    listPendingJoin(): MockJoinApplication[] {
      return joinApplications.filter((a) => a.status === 'PENDING')
    },
    getMyJoin(): { hasApplication: boolean; application: MockJoinApplication | null } {
      const u = profile.username
      const mine = joinApplications.filter((a) => a.applicantUsername === u)
      if (!mine.length) return { hasApplication: false, application: null }
      const last = mine.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
      return { hasApplication: true, application: last }
    },
    submitJoin(payload: {
      displayName: string
      intro: string
      skills?: string
      rankName?: string
      tags?: string
      pricePerHour?: number
      contactNote?: string
    }): { ok: boolean; message: string; applicationId: string } {
      if (mockUserLevel !== 0) {
        throw new Error('Mock: 仅顾客可申请成为打手')
      }
      const u = profile.username
      if (joinApplications.some((a) => a.applicantUsername === u && a.status === 'PENDING')) {
        throw new Error('Mock: 您已有待审核的申请')
      }
      const id = `JOIN-${Date.now()}`
      joinApplications.push({
        id,
        applicantUsername: u,
        displayName: payload.displayName.trim(),
        intro: payload.intro.trim(),
        skills: (payload.skills || '').trim(),
        rankName: (payload.rankName || '铂金').trim(),
        tags: (payload.tags || '').trim(),
        pricePerHour: typeof payload.pricePerHour === 'number' ? payload.pricePerHour : 99,
        contactNote: (payload.contactNote || '').trim(),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      })
      return { ok: true, message: '申请已提交（Mock）', applicationId: id }
    },
    approveJoin(appId: string): void {
      const app = joinApplications.find((a) => a.id === appId && a.status === 'PENDING')
      if (!app) return
      app.status = 'APPROVED'
      const pid = String(500 + joinExtraHallPlayers.length + 1)
      joinExtraHallPlayers.push({
        id: pid,
        name: app.displayName,
        avatar: 'https://picsum.photos/id/1005/300/300',
        rank: 'platinum',
        rankText: app.rankName || '铂金',
        rankColor: '#64748b',
        skills: app.skills ? app.skills.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : ['综合护航'],
        winRate: 75,
        completedOrders: 0,
        rating: 4.6,
        pricePerHour: app.pricePerHour,
        intro: app.intro,
        tags: app.tags ? app.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : ['平台认证']
      })
    },
    rejectJoin(appId: string, reason: string): void {
      const app = joinApplications.find((a) => a.id === appId && a.status === 'PENDING')
      if (!app) return
      app.status = 'REJECTED'
      app.rejectReason = reason
    },
    /** Mock 打手账号列表（供 BOSS 解除） */
    listMockPlayerAccounts(): Record<string, unknown>[] {
      const base = [
        {
          userId: '902',
          username: 'DaShou_YeXi',
          email: 'dashou_yexi@demo.delta',
          playerProfileId: '2',
          playerName: '夜袭者（Mock）'
        }
      ]
      return base.filter((row) => !mockRevokedPlayerUsernames.has(String(row.username)))
    },
    /** 按 Mock 账号 userId 解除打手（演示：902 → DaShou_YeXi） */
    revokeByUserId(userId: string): void {
      const map = [{ userId: '902', username: 'DaShou_YeXi' }].find((x) => String(x.userId) === userId)
      if (map) {
        mockRevokedPlayerUsernames.add(map.username)
        joinExtraHallPlayers = joinExtraHallPlayers.filter(
          (p) => String((p as { name?: string }).name) !== map.username
        )
      }
    }
  }
}

