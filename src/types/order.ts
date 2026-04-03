export type OrderStatus =
  | 'pending'
  | 'ongoing'
  | 'completion_pending'
  | 'completed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded'

export interface OrderPlayer {
  id: string
  name: string
  avatar: string
}

export interface Order {
  id: string
  game: string
  gameKey: string
  gameImage: string
  serviceType: string
  status: OrderStatus
  statusText: string
  amount: number
  createdAt: string
  player: OrderPlayer | null
  startTime?: string
  refundRequested?: boolean
  refundReason?: string
  /** 打手申请完成时填写的说明（待 BOSS 审核期间） */
  completionRequestNote?: string | null
}

export interface CreateOrderPayload {
  gameKey: string
  game: string
  gameImage: string
  serviceType: string
  amount: number
  serviceKey?: string
  source?: string
  playerId?: string
  playerName?: string
}

export interface RescheduleOrderPayload {
  orderId: string
  startTime: string
}

export interface RefundOrderPayload {
  orderId: string
  reason?: string
}

