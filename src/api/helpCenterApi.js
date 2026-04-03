import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const helpCenterApi = {
    /** 可选 category：order | service | account */
    async listFaqs(category) {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.helpCenter.faqs,
            query: category ? { category } : undefined,
            auth: true
        });
    }
};
