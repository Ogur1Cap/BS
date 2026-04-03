import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { CreateOrderPayload, Order, OrderStatus, RefundOrderPayload, RescheduleOrderPayload } from '../types/order'

/** 将后端枚举或历史小写状态统一为前端 OrderStatus */
export function normalizeOrderStatus(raw: string): OrderStatus {
  const up = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
  switch (up) {
    case 'PENDING':
      return 'pending'
    case 'IN_PROGRESS':
      return 'ongoing'
    case 'COMPLETION_PENDING':
      return 'completion_pending'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUND_REQUESTED':
      return 'refund_requested'
    case 'REFUNDED':
      return 'refunded'
    default: {
      const k = String(raw || '').toLowerCase()
      const allowed: OrderStatus[] = [
        'pending',
        'ongoing',
        'completion_pending',
        'completed',
        'cancelled',
        'refund_requested',
        'refunded'
      ]
      if (allowed.includes(k as OrderStatus)) return k as OrderStatus
      return 'pending'
    }
  }
}

const STATUS_TEXT_FALLBACK: Record<OrderStatus, string> = {
  pending: '待接单',
  ongoing: '进行中',
  completion_pending: '待审核完成',
  completed: '已完成',
  cancelled: '已取消',
  refund_requested: '退款申请中',
  refunded: '已退款'
}

function normalizePlayer(raw: unknown): Order['player'] {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = o.id != null ? String(o.id) : ''
  const name = String(o.name ?? '')
  if (!id && !name) return null
  return {
    id,
    name,
    avatar: String(o.avatar ?? 'https://picsum.photos/id/1005/40/40')
  }
}

/** 统一后端与 Mock 的订单 JSON 形状 */
export function normalizeOrder(raw: unknown): Order {
  const o = raw as Record<string, unknown>
  const status = normalizeOrderStatus(String(o.status ?? ''))
  return {
    id: String(o.id ?? ''),
    game: String(o.game ?? ''),
    gameKey: String(o.gameKey ?? ''),
    gameImage: String(o.gameImage ?? ''),
    serviceType: String(o.serviceType ?? ''),
    status,
    statusText: String(o.statusText ?? STATUS_TEXT_FALLBACK[status]),
    amount: typeof o.amount === 'number' ? o.amount : Number(o.amount ?? 0),
    createdAt: String(o.createdAt ?? ''),
    player: normalizePlayer(o.player),
    startTime: o.startTime ? String(o.startTime) : undefined,
    refundRequested: Boolean(o.refundRequested),
    refundReason: o.refundReason != null ? String(o.refundReason) : undefined,
    completionRequestNote: o.completionRequestNote != null ? String(o.completionRequestNote) : undefined
  }
}

function mapList(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => normalizeOrder(x))
}

export const ordersApi = {
  async listOrders(): Promise<Order[]> {
    const data = await apiRequest<unknown[]>({ method: 'GET', path: API_ENDPOINTS.orders.list, auth: true })
    return mapList(data)
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order[]> {
    const data = await apiRequest<unknown[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.create,
      auth: true,
      body: payload
    })
    return mapList(data)
  },

  async getOrderDetail(orderId: string): Promise<Order> {
    const data = await apiRequest<unknown>({
      method: 'GET',
      path: API_ENDPOINTS.orders.detail(orderId),
      auth: true
    })
    return normalizeOrder(data)
  },

  async rescheduleOrder(payload: RescheduleOrderPayload): Promise<Order[]> {
    const data = await apiRequest<unknown[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.reschedule(payload.orderId),
      auth: true,
      body: payload
    })
    return mapList(data)
  },

  async refundOrder(payload: RefundOrderPayload): Promise<Order[]> {
    const data = await apiRequest<unknown[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.refund(payload.orderId),
      auth: true,
      body: payload
    })
    return mapList(data)
  },

  async cancelOrder(orderId: string): Promise<Order[]> {
    const data = await apiRequest<unknown[]>({
      method: 'POST',
      path: API_ENDPOINTS.orders.cancel(orderId),
      auth: true,
      body: { orderId }
    })
    return mapList(data)
  }
}
