import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { WalletInfo, WalletEntity, RechargeRequest, AdminAdjustRequest } from '../types/wallet'

export const walletApi = {
  async getInfo(): Promise<WalletInfo> {
    return apiRequest<WalletInfo>({
      method: 'GET',
      path: API_ENDPOINTS.wallet.info,
      auth: true
    })
  },

  async recharge(payload: RechargeRequest): Promise<WalletEntity> {
    return apiRequest<WalletEntity>({
      method: 'POST',
      path: API_ENDPOINTS.wallet.recharge,
      auth: true,
      body: payload
    })
  },

  async adminAdjust(payload: AdminAdjustRequest): Promise<WalletEntity> {
    return apiRequest<WalletEntity>({
      method: 'POST',
      path: API_ENDPOINTS.wallet.adminAdjust,
      auth: true,
      body: payload
    })
  }
}
