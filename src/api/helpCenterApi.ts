import { apiRequest } from './request'
import { API_ENDPOINTS } from './endpoints'
import type { FaqItem } from '../types/faq'

export const helpCenterApi = {
  /** 可选 category：order | service | account */
  async listFaqs(category?: string): Promise<FaqItem[]> {
    return apiRequest<FaqItem[]>({
      method: 'GET',
      path: API_ENDPOINTS.helpCenter.faqs,
      query: category ? { category } : undefined,
      auth: true
    })
  }
}
