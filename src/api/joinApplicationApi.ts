import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

export interface JoinApplicationPayload {
  displayName: string
  intro: string
  skills?: string
  rankName?: string
  tags?: string
  pricePerHour?: number
  contactNote?: string
}

export interface JoinApplicationDto {
  id: string
  status: string
  displayName: string
  intro: string
  skills?: string
  rankName?: string
  tags?: string
  pricePerHour?: number
  contactNote?: string
  createdAt: string
  rejectReason?: string
}

export interface JoinSubmitResult {
  ok: boolean
  message: string
  applicationId?: string
}

export const joinApplicationApi = {
  async submit(payload: JoinApplicationPayload): Promise<JoinSubmitResult> {
    return apiRequest<JoinSubmitResult>({
      method: 'POST',
      path: API_ENDPOINTS.playerJoin.submit,
      auth: true,
      body: payload
    })
  },

  async getMy(): Promise<{ hasApplication: boolean; application: JoinApplicationDto | null }> {
    return apiRequest({
      method: 'GET',
      path: API_ENDPOINTS.playerJoin.me,
      auth: true
    })
  }
}
