export interface Transaction {
  id: number
  orderId?: number | null
  type: 'INCOME' | 'EXPENSE'
  amount: number
  paymentMethod?: string
  description?: string
  operatorId?: number
  status: string
  createdAt: string
  updatedAt?: string
}

export interface CreateTransactionPayload {
  orderId?: number
  type: 'INCOME' | 'EXPENSE'
  amount: number
  paymentMethod?: string
  description?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  netAmount: number
}

export interface DailyStats {
  date: string
  dailyIncome: number
  dailyExpense: number
  transactionCount: number
}
