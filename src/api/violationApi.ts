import { apiRequest } from './request'

export interface ViolationRecord {
  id: string
  userId: string
  username?: string
  violationCount?: number
  isHighRisk?: boolean
  userStatus?: string
  type: string
  description: string
  relatedId?: string
  status: 'PENDING' | 'APPEALED' | 'RESOLVED'
  appealReason?: string
  adminAction?: string
  adminNotes?: string
  createdAt: string
  updatedAt?: string
}

export const violationApi = {
  /**
   * 用户获取个人违规记录
   */
  getMyViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: '/api/violation/my',
      auth: true
    })
  },

  /**
   * 用户提交违规申诉
   */
  submitAppeal: async (id: string, reason: string): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      path: `/api/violation/appeal/${id}`,
      body: { reason },
      auth: true
    })
  },

  /**
   * BOSS获取待处理预警
   */
  getPendingViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: '/api/violation/boss/pending',
      auth: true
    })
  },

  /**
   * BOSS获取申诉列表
   */
  getAppealedViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: '/api/violation/boss/appealed',
      auth: true
    })
  },

  /**
   * BOSS获取所有违规记录
   */
  getAllViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: '/api/violation/boss/all',
      auth: true
    })
  },

  /**
   * BOSS处理违规/申诉
   */
  handleViolation: async (id: string, action: string, notes: string): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      path: `/api/violation/boss/handle/${id}`,
      body: { action, notes },
      auth: true
    })
  }
}
