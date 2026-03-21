export type OrderStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled'

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

