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
}

