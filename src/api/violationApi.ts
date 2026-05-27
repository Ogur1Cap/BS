import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

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
  getMyViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: API_ENDPOINTS.violation.my,
      auth: true
    })
  },

  submitAppeal: async (id: string, reason: string): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      path: API_ENDPOINTS.violation.appeal(id),
      body: { reason },
      auth: true
    })
  },

  getPendingViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: API_ENDPOINTS.violation.bossPending,
      auth: true
    })
  },

  getAppealedViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: API_ENDPOINTS.violation.bossAppealed,
      auth: true
    })
  },

  getAllViolations: async (): Promise<ViolationRecord[]> => {
    return apiRequest<ViolationRecord[]>({
      method: 'GET',
      path: API_ENDPOINTS.violation.bossAll,
      auth: true
    })
  },

  handleViolation: async (id: string, action: string, notes: string): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      path: API_ENDPOINTS.violation.bossHandle(id),
      body: { action, notes },
      auth: true
    })
  }
}
