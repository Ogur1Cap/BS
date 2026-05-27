import { defineStore } from 'pinia'
import { walletApi } from '../api/walletApi'
import type { WalletEntity, WalletTransaction } from '../types/wallet'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance: 0 as number,
    totalRecharged: 0 as number,
    transactions: [] as WalletTransaction[],
    loaded: false,
    loading: false
  }),

  getters: {
    balanceDisplay(): string {
      return (this.balance / 100).toLocaleString('zh-CN')
    },

    totalRechargedDisplay(): string {
      return (this.totalRecharged / 100).toLocaleString('zh-CN')
    },

    monthlyIncome(): number {
      const now = Date.now()
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      return this.transactions
        .filter(t => t.type === 'RECHARGE' && new Date(t.createdAt).getTime() > monthAgo)
        .reduce((sum, t) => sum + Math.max(0, t.amount), 0)
    },

    monthlySpending(): number {
      const now = Date.now()
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      return this.transactions
        .filter(t => t.type === 'ORDER_PAY' && new Date(t.createdAt).getTime() > monthAgo)
        .reduce((sum, t) => sum + Math.max(0, -t.amount), 0)
    }
  },

  actions: {
    async refresh() {
      if (this.loading) return
      this.loading = true
      try {
        const info = await walletApi.getInfo()
        this.balance = info.wallet.balance
        this.totalRecharged = info.wallet.totalRecharged
        this.transactions = info.transactions
        this.loaded = true
        return info
      } finally {
        this.loading = false
      }
    },

    async recharge(amount: number, description?: string) {
      await walletApi.recharge({ amount, description })
      await this.refresh()
    },

    balanceAfterRecharge(amountYuan: number): number {
      return this.balance + Math.round(amountYuan * 100)
    },

    isBalanceSufficient(amountYuan: number): boolean {
      return this.balance >= Math.round(amountYuan * 100)
    },

    ensureLoaded() {
      if (!this.loaded && !this.loading) {
        return this.refresh()
      }
      return Promise.resolve()
    }
  }
})
