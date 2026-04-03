import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'

export interface CreateSupportTicketPayload {
  username: string
  contact: string
  problemType: string
  emergencyLevel: string
  problemDesc: string
}

export interface SupportTicketCreated {
  id: string
  status: string
}

export const supportCenterApi = {
  async createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicketCreated> {
    return apiRequest<SupportTicketCreated>({
      method: 'POST',
      path: API_ENDPOINTS.supportCenter.tickets,
      auth: true,
      body: payload
    })
  }
}
