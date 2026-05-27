export interface OverviewStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  inProgressOrders: number
  cancelledOrders: number
  totalUsers: number
  customerCount: number
  playerCount: number
  totalIncome: number
  totalExpense: number
  netRevenue: number
}

export interface StatusCount {
  status: string
  label: string
  count: number
}

export interface UserLevelCount {
  level: number
  label: string
  count: number
}
