export interface WalletEntity {
  id: number
  userId: number
  balance: number
  totalRecharged: number
  version: number
  createdAt: string
  updatedAt?: string
}

export interface WalletTransaction {
  id: number
  walletId: number
  userId: number
  amount: number
  balanceAfter: number
  type: 'RECHARGE' | 'ORDER_PAY' | 'ORDER_REFUND' | 'ADMIN_ADJUST' | 'PLAYER_PAYOUT'
  orderId?: number
  description?: string
  operatorId?: number
  createdAt: string
}

export interface WalletInfo {
  wallet: WalletEntity
  transactions: WalletTransaction[]
}

export interface RechargeRequest {
  amount: number
  description?: string
}

export interface DeductRequest {
  amount: number
  orderId?: number
  description?: string
}

export interface AdminAdjustRequest {
  userId: number
  amount: number
  description?: string
}
