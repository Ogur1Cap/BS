import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { Transaction, CreateTransactionPayload, TransactionSummary, DailyStats } from '../types/transaction'

export const transactionApi = {
  async list(): Promise<Transaction[]> {
    return apiRequest<Transaction[]>({
      method: 'GET',
      path: API_ENDPOINTS.transactions.list,
      auth: true
    })
  },

  async detail(id: number): Promise<Transaction> {
    return apiRequest<Transaction>({
      method: 'GET',
      path: API_ENDPOINTS.transactions.detail(id),
      auth: true
    })
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    return apiRequest<Transaction>({
      method: 'POST',
      path: API_ENDPOINTS.transactions.create,
      auth: true,
      body: payload
    })
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>({
      method: 'DELETE',
      path: API_ENDPOINTS.transactions.delete(id),
      auth: true
    })
  },

  async getSummary(): Promise<TransactionSummary> {
    return apiRequest<TransactionSummary>({
      method: 'GET',
      path: API_ENDPOINTS.transactions.summary,
      auth: true
    })
  },

  async getDailyStats(date?: string): Promise<DailyStats> {
    return apiRequest<DailyStats>({
      method: 'GET',
      path: API_ENDPOINTS.transactions.daily,
      auth: true,
      query: date ? { date } : undefined
    })
  }
}
