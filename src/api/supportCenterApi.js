import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const supportCenterApi = {
    async createTicket(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.supportCenter.tickets,
            auth: true,
            body: payload
        });
    }
};
