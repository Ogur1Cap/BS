import type { ApiRequestOptions } from '../api/request'
import { mockDb } from './mockDb'
import { getAuthUser } from '../api/token'
import type { LoginResponse } from '../types/auth'
import type { Order } from '../types/order'
import type { Profile } from '../types/profile'
import type { AccountSettings } from '../types/accountSettings'
import type { FaqItem } from '../types/faq'
import type { MapMarkerDto } from '../types/gameMap'
import type { MissionBriefing } from '../types/missionBriefing'

/**
 * Mock 打手大厅：与库种子 players.id=1..5 及 `/player-hall/players` 真实接口字段一致，
 * 避免「p2」与打手档案主键「2」不一致导致工作台无单。
 */
const MOCK_HALL_PLAYERS: Record<string, unknown>[] = [
  {
    id: '1',
    name: '三角洲-猎鹰',
    avatar: 'https://picsum.photos/id/1012/300/300',
    rank: 'legend',
    rankText: '传奇',
    rankColor: '#f59e0b',
    skills: ['战术指挥', '精准狙击', '段位冲刺'],
    winRate: 82,
    completedOrders: 1246,
    rating: 4.9,
    pricePerHour: 180,
    intro: '5 年三角洲行动经验，擅长指挥与高难度局，支持全程录屏。',
    tags: ['全程直播', '胜率保障', '段位包过']
  },
  {
    id: '2',
    name: '夜袭者',
    avatar: 'https://picsum.photos/id/1025/300/300',
    rank: 'master',
    rankText: '大师',
    rankColor: '#06b6d4',
    skills: ['突击攻坚', '装备获取', '快速推进'],
    winRate: 78,
    completedOrders: 987,
    rating: 4.8,
    pricePerHour: 150,
    intro: '专注物资点清缴与突击推进，效率高、沟通清晰。',
    tags: ['装备速刷', '突击专精', '高效完成']
  },
  {
    id: '3',
    name: '战术大师-凯',
    avatar: 'https://picsum.photos/id/1074/300/300',
    rank: 'diamond',
    rankText: '钻石',
    rankColor: '#3b82f6',
    skills: ['战术指挥', '新手指导', '特殊任务'],
    winRate: 75,
    completedOrders: 856,
    rating: 4.7,
    pricePerHour: 130,
    intro: '擅长带新手熟悉地图与机制，耐心讲解每一步决策。',
    tags: ['新手友好', '战术教学', '耐心指导']
  },
  {
    id: '4',
    name: '狙神-零度',
    avatar: 'https://picsum.photos/id/1062/300/300',
    rank: 'legend',
    rankText: '传奇',
    rankColor: '#f59e0b',
    skills: ['精准狙击', '远程压制', '点位控制'],
    winRate: 85,
    completedOrders: 762,
    rating: 4.9,
    pricePerHour: 200,
    intro: '远程架点与信息位专精，适合需要控场的队伍。',
    tags: ['狙击专精', '远程压制', '高命中率']
  },
  {
    id: '5',
    name: '突击手-狂狼',
    avatar: 'https://picsum.photos/id/1084/300/300',
    rank: 'master',
    rankText: '大师',
    rankColor: '#06b6d4',
    skills: ['突击攻坚', '近战格斗', '快速清场'],
    winRate: 76,
    completedOrders: 632,
    rating: 4.6,
    pricePerHour: 140,
    intro: '近战突破与清房能力强，适合快节奏对局。',
    tags: ['近战专精', '快速清场', '敢打敢冲']
  }
]

/** Mock：帮助中心 FAQ（与后端种子数据语义一致） */
const MOCK_FAQS: FaqItem[] = [
  { id: '1', category: 'order', question: '怎么修改护航订单时间？', answer: '进入「我的订单」→ 找到对应订单→ 点击「修改时间」→ 选择新时间提交（已接单需先和打手确认）。' },
  { id: '2', category: 'order', question: '订单能取消退款吗？', answer: '未接单：直接取消，全额退款（1-3 个工作日到账）；已接单未开始：可能收取少量手续费；已开始：按完成比例协商退款。' },
  { id: '3', category: 'order', question: '订单「待接单」要等多久？', answer: '通常 10–30 分钟内会有打手接单；超时可在订单页尝试加急或联系客服协调匹配。' },
  { id: '4', category: 'service', question: '护航会导致账号被封吗？', answer: '平台要求打手手动操作、拒绝作弊工具；请使用临时密码并在服务结束后及时修改，可降低风险。' },
  { id: '5', category: 'service', question: '能指定打手吗？', answer: '可以：在「打手大厅」选择打手发起预约；或在下单备注中写明打手昵称，客服会协助撮合。' },
  { id: '6', category: 'service', question: '装备代刷没刷到怎么办？', answer: '请保留对局记录与截图联系客服核实；未履约部分可按规则退款或协商补刷。' },
  { id: '7', category: 'account', question: '给打手账号，怎么保证安全？', answer: '建议：使用临时密码；服务期间避免多端互顶；结束后立即改密并开启官方安全保护。' },
  { id: '8', category: 'account', question: '账号被冻结了怎么办？', answer: '区分游戏官方冻结与平台风控：官方按游戏内指引申诉；平台冻结可联系客服提交材料复核。' },
  { id: '9', category: 'account', question: '忘记密码怎么找？', answer: '登录页使用「忘记密码」通过绑定手机/邮箱重置；若未绑定请联系人工客服核验身份后处理。' }
]

/** Mock：地图自定义标记（仅 mock 模式下的内存状态） */
let mockMapMarkers: MapMarkerDto[] = []

/** Mock：打手工作台待接单 / 服务中（内存） */
let mockDeskPending: Record<string, unknown>[] = [
  {
    id: 'MOCK-ORD-001',
    game: '三角洲行动',
    gameKey: 'delta',
    gameImage: '',
    serviceType: '机密护航',
    status: 'PENDING',
    statusText: '待接单',
    amount: 168,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    startTime: null,
    customerUsername: '演示顾客',
    player: { id: '2', name: '夜袭者' }
  }
]
/** 服务中 / 待审核完成（与后端状态字符串一致便于联调） */
let mockDeskServing: Record<string, unknown>[] = [
  {
    id: 'MOCK-ORD-SRV',
    game: '三角洲行动',
    gameKey: 'delta',
    gameImage: '',
    serviceType: '机密护航',
    status: 'IN_PROGRESS',
    statusText: '进行中',
    amount: 168,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    startTime: new Date(Date.now() + 3600_000).toISOString(),
    customerUsername: '演示顾客',
    player: { id: '2', name: '夜袭者' },
    completionRequestNote: null
  }
]

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
        phone: updatedProfile.phone,
        userLevel: updatedProfile.userLevel ?? 0
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

  if (method === 'GET' && path === '/notifications/unread-count') {
    return { count: mockDb.notification.unreadCount() } as T
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
    const list = mockDb.orders.create(payload)
    const created = list[0] as Order | undefined
    // 指定打手时：同步打手工作台待接单 + 打手可见通知（与真实后端行为对齐）
    if (created?.player?.id) {
      const prof = mockDb.profile.get()
      mockDeskPending.unshift({
        id: created.id,
        game: created.game,
        gameKey: created.gameKey,
        gameImage: created.gameImage || '',
        serviceType: created.serviceType,
        status: 'PENDING',
        statusText: '待接单',
        amount: created.amount,
        createdAt: created.createdAt,
        startTime: created.startTime ?? null,
        customerUsername: prof.username,
        player: { id: created.player.id, name: created.player.name }
      })
      mockDb.notification.pushPlayerOnlyOrder(
        '新订单待接单',
        `顾客 ${prof.username} 指定您接单：${created.game} · ${created.serviceType}，金额 ¥${created.amount}。`,
        created.id
      )
    }
    return list as unknown as T
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

  // 帮助中心
  if (method === 'GET' && path === '/help-center/faqs') {
    const cat = options.query?.category
    const list =
      cat === undefined || cat === ''
        ? MOCK_FAQS
        : MOCK_FAQS.filter((f) => f.category === String(cat))
    return list as unknown as T
  }

  // 客服工单
  if (method === 'POST' && path === '/support-center/tickets') {
    const id = `MOCK-${Date.now()}`
    return { id, status: 'QUEUED' } as T
  }

  // 打手大厅（种子 1..5 + 入驻审核通过后追加的打手）
  if (method === 'GET' && path === '/player-hall/players') {
    const rows: Record<string, unknown>[] = [...MOCK_HALL_PLAYERS, ...mockDb.joinUs.hallExtras()]
    return rows as unknown as T
  }

  // 加入我们（入驻申请）
  if (method === 'POST' && path === '/player-join-applications') {
    const body = assertBody<{
      displayName: string
      intro: string
      skills?: string
      rankName?: string
      tags?: string
      pricePerHour?: number
      contactNote?: string
    }>(options.body || {})
    const res = mockDb.joinUs.submitJoin(body)
    return res as unknown as T
  }

  if (method === 'GET' && path === '/player-join-applications/me') {
    const my = mockDb.joinUs.getMyJoin()
    if (!my.hasApplication || !my.application) {
      return { hasApplication: false, application: null } as T
    }
    const a = my.application
    return {
      hasApplication: true,
      application: {
        id: a.id,
        status: a.status,
        displayName: a.displayName,
        intro: a.intro,
        skills: a.skills,
        rankName: a.rankName,
        tags: a.tags,
        pricePerHour: a.pricePerHour,
        contactNote: a.contactNote,
        createdAt: a.createdAt,
        rejectReason: a.rejectReason
      }
    } as T
  }

  // 游戏地图 POI
  if (method === 'GET' && path === '/game-map/pois') {
    const pois: Record<string, unknown>[] = [
      { id: 'p1', name: '行政补给站', x: 360, y: 250, floor: 1, type: 'resource', modes: ['normal', 'attack'], security: ['normal', 'secret'] },
      { id: 'p2', name: '观察塔出生点', x: 210, y: 780, floor: 1, type: 'spawn', modes: ['normal', 'occupy'], security: ['normal', 'secret', 'top-secret'] },
      { id: 'p3', name: '下水道撤离点', x: 1460, y: 1020, floor: 1, type: 'extract', modes: ['normal'], security: ['normal', 'secret'] }
    ]
    return pois as unknown as T
  }

  if (method === 'GET' && path === '/game-map/markers') {
    return [...mockMapMarkers] as unknown as T
  }

  if (method === 'POST' && path === '/game-map/markers') {
    const b = assertBody<{ x: number; y: number; label: string; note?: string }>(options.body)
    const id = `mk_${Date.now()}`
    mockMapMarkers = [{ id, x: b.x, y: b.y, label: b.label, note: b.note ?? '' }, ...mockMapMarkers]
    return [...mockMapMarkers] as unknown as T
  }

  if (method === 'PUT' && path.startsWith('/game-map/markers/')) {
    const id = decodeURIComponent(path.split('/')[3] || '')
    const b = assertBody<{ label?: string; note?: string }>(options.body)
    mockMapMarkers = mockMapMarkers.map((m) =>
      m.id === id ? { ...m, label: b.label ?? m.label, note: b.note ?? m.note } : m
    )
    return [...mockMapMarkers] as unknown as T
  }

  if (method === 'DELETE' && path.startsWith('/game-map/markers/')) {
    const id = decodeURIComponent(path.split('/')[3] || '')
    mockMapMarkers = mockMapMarkers.filter((m) => m.id !== id)
    return [...mockMapMarkers] as unknown as T
  }

  // —— 打手工作台（Mock：需使用用户名 DaShou_YeXi 登录） ——
  const assertPlayerMock = () => {
    if (mockDb.profile.getUserLevel() !== 1) {
      throw new Error('Mock: 打手工作台需要打手账号（1 级），请使用 DaShou_YeXi 登录（任意密码）')
    }
  }

  const assertBossMock = () => {
    if (mockDb.profile.getUserLevel() < 2) {
      throw new Error('Mock: BOSS 控制台需要 BOSS 账号，请使用 BOSS_Delta 登录（任意密码）')
    }
  }

  const mockBossPlayers = () => {
    const extra = mockDb.joinUs.hallExtras().map((p) => {
      const o = p as { id?: string; name?: string; avatar?: string }
      return {
        id: Number(o.id),
        name: String(o.name || ''),
        avatar: String(o.avatar || '')
      }
    })
    return [
      { id: 1, name: '三角洲-猎鹰', avatar: '' },
      { id: 2, name: '夜袭者', avatar: '' },
      { id: 3, name: '战术大师-凯', avatar: '' },
      { id: 4, name: '狙神-零度', avatar: '' },
      { id: 5, name: '突击手-狂狼', avatar: '' },
      ...extra
    ]
  }

  const toBossRow = (row: Record<string, unknown>) => ({
    ...row,
    userId: '1',
    customerUsername: (row.customerUsername as string) || '演示顾客'
  })

  if (method === 'GET' && path === '/player-desk/stats') {
    assertPlayerMock()
    return {
      pendingCount: mockDeskPending.length,
      servingCount: mockDeskServing.length,
      completedWeekCount: 3,
      playerProfileId: '2',
      displayHint: '接单后请及时与顾客确认上号时间；拒单将通知顾客重新匹配。'
    } as T
  }

  if (method === 'GET' && path === '/player-desk/orders/pending') {
    assertPlayerMock()
    return [...mockDeskPending] as unknown as T
  }

  if (method === 'GET' && path === '/player-desk/orders/serving') {
    assertPlayerMock()
    return [...mockDeskServing] as unknown as T
  }

  if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/accept')) {
    assertPlayerMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 2] || ''
    const idx = mockDeskPending.findIndex((o) => o.id === oid)
    if (idx >= 0) {
      const [row] = mockDeskPending.splice(idx, 1)
      const next = {
        ...row,
        status: 'IN_PROGRESS',
        statusText: '进行中',
        startTime: new Date().toISOString()
      }
      mockDeskServing.unshift(next)
    }
    return [...mockDeskPending] as unknown as T
  }

  if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/reject')) {
    assertPlayerMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 2] || ''
    mockDeskPending = mockDeskPending.filter((o) => o.id !== oid)
    return [...mockDeskPending] as unknown as T
  }

  if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/complete-request')) {
    assertPlayerMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 2] || ''
    const body = assertBody<{ note?: string }>(options.body || {})
    const idx = mockDeskServing.findIndex((o) => String(o.id) === oid)
    if (idx >= 0) {
      const row = mockDeskServing[idx]
      if (String(row.status) !== 'IN_PROGRESS') {
        throw new Error('Mock: 仅进行中的订单可申请完成')
      }
      row.status = 'COMPLETION_PENDING'
      row.statusText = '待审核完成'
      row.completionRequestNote = body.note?.trim() || ''
    }
    return [...mockDeskServing] as unknown as T
  }

  if (method === 'GET' && path === '/boss-desk/stats') {
    assertBossMock()
    return {
      pendingCompletionCount: mockDeskServing.filter((o) => o.status === 'COMPLETION_PENDING').length,
      manageableOrderCount: mockDeskPending.length + mockDeskServing.length,
      pendingJoinCount: mockDb.joinUs.listPendingJoin().length,
      displayHint: '审核打手完成申请时请核对履约情况；转派订单务必填写备注，顾客将收到通知。'
    } as T
  }

  if (method === 'GET' && path === '/boss-desk/orders/completion-pending') {
    assertBossMock()
    return mockDeskServing.filter((o) => o.status === 'COMPLETION_PENDING').map(toBossRow) as unknown as T
  }

  if (method === 'GET' && path === '/boss-desk/orders/manageable') {
    assertBossMock()
    const merged = [...mockDeskPending, ...mockDeskServing].map((r) => toBossRow({ ...r }))
    return merged as unknown as T
  }

  if (method === 'GET' && path === '/boss-desk/players') {
    assertBossMock()
    return mockBossPlayers() as unknown as T
  }

  if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/completion/approve')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 3] || ''
    mockDeskServing = mockDeskServing.filter((o) => String(o.id) !== oid)
    return undefined as T
  }

  if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/completion/reject')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 3] || ''
    const body = assertBody<{ reason?: string }>(options.body || {})
    const row = mockDeskServing.find((o) => String(o.id) === oid)
    if (row && row.status === 'COMPLETION_PENDING') {
      row.status = 'IN_PROGRESS'
      row.statusText = '进行中'
      row.completionRequestNote = null
    }
    return undefined as T
  }

  if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/reassign')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 2] || ''
    const body = assertBody<{ targetPlayerId?: number; remark?: string }>(options.body || {})
    if (!body.remark?.trim()) throw new Error('Mock: 转派需填写备注')
    const pid = body.targetPlayerId
    if (pid == null) throw new Error('Mock: 缺少 targetPlayerId')
    const pl = mockBossPlayers().find((p) => p.id === pid)
    const name = pl?.name || `打手#${pid}`

    const inPending = mockDeskPending.findIndex((o) => String(o.id) === oid)
    if (inPending >= 0) {
      const row = mockDeskPending[inPending]
      row.player = { id: String(pid), name }
      return undefined as T
    }
    const inServing = mockDeskServing.findIndex((o) => String(o.id) === oid)
    if (inServing >= 0) {
      const row = mockDeskServing[inServing]
      row.player = { id: String(pid), name }
      if (row.status === 'COMPLETION_PENDING') {
        row.status = 'IN_PROGRESS'
        row.statusText = '进行中'
        row.completionRequestNote = null
      }
      return undefined as T
    }
    throw new Error('Mock: 订单不存在')
  }

  if (method === 'GET' && path === '/boss-desk/join-applications/pending') {
    assertBossMock()
    return mockDb.joinUs.listPendingJoin().map((a) => ({
      id: a.id,
      status: a.status,
      displayName: a.displayName,
      intro: a.intro,
      skills: a.skills,
      rankName: a.rankName,
      tags: a.tags,
      pricePerHour: a.pricePerHour,
      contactNote: a.contactNote,
      createdAt: a.createdAt,
      applicantUsername: a.applicantUsername,
      applicantEmail: `mock_${a.applicantUsername}@local`
    })) as unknown as T
  }

  if (method === 'POST' && path.includes('/boss-desk/join-applications/') && path.endsWith('/approve')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const aid = segs[segs.length - 2] || ''
    mockDb.joinUs.approveJoin(aid)
    return undefined as T
  }

  if (method === 'POST' && path.includes('/boss-desk/join-applications/') && path.endsWith('/reject')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const aid = segs[segs.length - 2] || ''
    const body = assertBody<{ reason?: string }>(options.body || {})
    mockDb.joinUs.rejectJoin(aid, body.reason?.trim() || '未说明')
    return undefined as T
  }

  if (method === 'GET' && path === '/boss-desk/player-accounts') {
    assertBossMock()
    return mockDb.joinUs.listMockPlayerAccounts() as unknown as T
  }

  if (method === 'POST' && path.includes('/boss-desk/player-accounts/') && path.endsWith('/revoke')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const uid = segs[segs.length - 2] || ''
    mockDb.joinUs.revokeByUserId(uid)
    return undefined as T
  }

  // 今日行动简报
  if (method === 'GET' && path === '/delta/mission-briefing') {
    const briefing: MissionBriefing = {
      title: '今日行动简报',
      mapName: '零号大坝',
      date: new Date().toISOString().slice(0, 10),
      tip: '开局先听枪声方向，避免盲冲开阔地；撤离前留一条备用路线。',
      tag: '战术提示'
    }
    return briefing as T
  }

  // —— 流水管理（仅 BOSS 可操作）——
  const assertBossTransaction = () => {
    if (mockDb.profile.getUserLevel() < 2) {
      throw new Error('Mock: 流水管理需要 BOSS 权限')
    }
  }

  if (method === 'GET' && path === '/transactions') {
    assertBossTransaction()
    return mockDb.transactions.list() as unknown as T
  }

  if (method === 'POST' && path === '/transactions') {
    assertBossTransaction()
    const body = assertBody<{ type: string; amount: number; paymentMethod?: string; description?: string; orderId?: number }>(options.body)
    if (!body.type || !['INCOME', 'EXPENSE'].includes(body.type)) {
      throw new Error('Mock: 类型必须是 INCOME 或 EXPENSE')
    }
    if (!body.amount || body.amount <= 0) {
      throw new Error('Mock: 金额必须大于0')
    }
    const res = mockDb.transactions.create(body)
    return res as unknown as T
  }

  if (method === 'DELETE' && path.startsWith('/transactions/') && !path.includes('/summary') && !path.includes('/daily')) {
    assertBossTransaction()
    const id = Number(path.split('/')[2])
    mockDb.transactions.delete(id)
    return undefined as T
  }

  if (method === 'GET' && path === '/transactions/summary') {
    assertBossTransaction()
    return mockDb.transactions.summary() as unknown as T
  }

  if (method === 'GET' && path === '/transactions/daily') {
    assertBossTransaction()
    return mockDb.transactions.dailyStats() as unknown as T
  }

  if (method === 'GET' && path.startsWith('/transactions/') && !path.includes('/summary') && !path.includes('/daily')) {
    assertBossTransaction()
    const id = Number(path.split('/')[2])
    const item = mockDb.transactions.list().find((d: Record<string, unknown>) => Number(d.id) === id)
    if (!item) throw new Error(`Mock: 流水 #${id} 不存在`)
    return item as unknown as T
  }

  // —— 数据统计 ——
  if (method === 'GET' && path === '/statistics/overview') {
    assertBossMock()
    const orders = mockDb.orders.list() as unknown as Record<string, unknown>[]
    const income = mockDb.transactions.summary().totalIncome
    const expense = mockDb.transactions.summary().totalExpense
    return {
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      inProgressOrders: orders.filter((o) => o.status === 'ongoing').length,
      cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
      totalUsers: 6,
      customerCount: 4,
      playerCount: 1,
      totalIncome: income,
      totalExpense: expense,
      netRevenue: income - expense
    } as T
  }

  if (method === 'GET' && path === '/statistics/orders-by-status') {
    assertBossMock()
    const orders = mockDb.orders.list()
    const countByStatus = (status: string) => (orders as unknown as Record<string, unknown>[]).filter((o) => o.status === status).length
    return [
      { status: 'PENDING', label: '待接单', count: countByStatus('pending') },
      { status: 'IN_PROGRESS', label: '进行中', count: countByStatus('ongoing') },
      { status: 'COMPLETION_PENDING', label: '待审核', count: countByStatus('completion_pending') },
      { status: 'COMPLETED', label: '已完成', count: countByStatus('completed') },
      { status: 'CANCELLED', label: '已取消', count: countByStatus('cancelled') },
      { status: 'REFUND_REQUESTED', label: '退款中', count: countByStatus('refund_requested') },
      { status: 'REFUNDED', label: '已退款', count: countByStatus('refunded') }
    ] as T
  }

  if (method === 'GET' && path === '/statistics/users-by-level') {
    assertBossMock()
    return [
      { level: 0, label: '顾客', count: 4 },
      { level: 1, label: '打手', count: 1 },
      { level: 2, label: '管理员', count: 1 }
    ] as T
  }

  // —— 钱包/栗币 ——
  function getMockUserId(): number {
    const userData = getAuthUser()
    const name = userData?.username || ''
    if (name === 'BOSS_Delta') return 3
    if (name === 'DaShou_YeXi') return 2
    return 1
  }

  if (method === 'GET' && path === '/wallet') {
    const uid = getMockUserId()
    return mockDb.wallet.getInfo(uid) as unknown as T
  }

  if (method === 'POST' && path === '/wallet/recharge') {
    const body = assertBody<{ amount: number; description?: string }>(options.body)
    if (!body.amount || body.amount <= 0) throw new Error('充值金额必须大于0')
    const uid = getMockUserId()
    const amountInCents = Math.round(body.amount * 100)
    return mockDb.wallet.recharge(uid, amountInCents, body.description) as unknown as T
  }

  if (method === 'POST' && path === '/wallet/admin/adjust') {
    assertBossMock()
    const body = assertBody<{ userId: number; amount: number; description?: string }>(options.body)
    const amountInCents = Math.round(body.amount * 100)
    return mockDb.wallet.adminAdjust(body.userId, amountInCents, body.description) as unknown as T
  }

  // —— 违规记录 API（前缀 /api/violation/）——
  const MOCK_VIOLATIONS: Record<string, unknown>[] = [
    { id: 1, userId: 1, username: 'XiaoLiMao', type: 'MALICIOUS_REFUND', description: '在订单即将完成时申请退款', status: 'PENDING', relatedId: 'ORD-12345', violationCount: 1, isHighRisk: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, userId: 1, username: 'XiaoLiMao', type: 'FAKE_ORDER', description: '1小时内创建超过5个订单', status: 'APPEALED', relatedId: 'ORD-12346', violationCount: 2, isHighRisk: false, createdAt: new Date(Date.now() - 172800000).toISOString(), appealReason: '我是正常操作，不是恶意刷单' },
    { id: 3, userId: 3, username: 'demo_user', type: 'IMPROPER_SERVICE', description: '服务态度不佳，被用户投诉', status: 'RESOLVED', relatedId: 'ORD-12347', violationCount: 1, isHighRisk: false, createdAt: new Date(Date.now() - 259200000).toISOString(), adminAction: 'WARNING', adminNotes: '已警告' }
  ]
  let mockViolations = [...MOCK_VIOLATIONS]
  let nextViolationId = 10

  if (method === 'GET' && path === '/api/violation/my') {
    const userData = getAuthUser()
    const username = userData?.username || ''
    return mockViolations.filter(v => String(v.username) === username) as unknown as T
  }

  if (method === 'POST' && path.startsWith('/api/violation/appeal/')) {
    const id = Number(path.split('/')[4])
    const body = assertBody<{ reason: string }>(options.body)
    const v = mockViolations.find(v => v.id === id)
    if (v) {
      v.status = 'APPEALED'
      v.appealReason = body.reason
    }
    return { ok: true } as T
  }

  if (method === 'GET' && path === '/api/violation/boss/pending') {
    assertBossMock()
    return mockViolations.filter(v => v.status === 'PENDING') as unknown as T
  }

  if (method === 'GET' && path === '/api/violation/boss/appealed') {
    assertBossMock()
    return mockViolations.filter(v => v.status === 'APPEALED') as unknown as T
  }

  if (method === 'GET' && path === '/api/violation/boss/all') {
    assertBossMock()
    return [...mockViolations] as unknown as T
  }

  if (method === 'POST' && path.startsWith('/api/violation/boss/handle/')) {
    assertBossMock()
    const id = Number(path.split('/')[5])
    const body = assertBody<{ action: string; notes: string }>(options.body)
    const v = mockViolations.find(v => v.id === id)
    if (v) {
      v.status = 'RESOLVED'
      v.adminAction = body.action
      v.adminNotes = body.notes
    }
    return { ok: true } as T
  }

  // —— BossDesk 退款处理（补充，Mock 路由中已有的订单列表将包含退款待处理）——
  if (method === 'GET' && path === '/boss-desk/orders/refund-pending') {
    assertBossMock()
    const allOrders = mockDb.orders.list() as unknown as Record<string, unknown>[]
    return allOrders.filter(o => String(o.status) === 'refund_requested').map(o => ({
      ...o,
      customerUsername: '演示顾客',
      refundReason: o.refundReason || '用户申请退款'
    })) as unknown as T
  }

  if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/refund/process')) {
    assertBossMock()
    const segs = path.split('/').filter(Boolean)
    const oid = segs[segs.length - 3] || ''
    const body = assertBody<{ approve: boolean; adminNote?: string }>(options.body)
    const orders = mockDb.orders.list() as unknown as Record<string, unknown>[]
    const order = orders.find(o => String(o.id) === oid)
    if (order) {
      order.status = body.approve ? 'refunded' : 'completed'
      order.statusText = body.approve ? '已退款' : '已完成'
    }
    return undefined as T
  }

  // 如果未匹配到 mock 路由，直接抛错，方便你继续补齐接口
  throw new Error(`Mock: no handler for ${method} ${path}`)
}

