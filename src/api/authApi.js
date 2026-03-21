import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const authApi = {
    async login(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.auth.login,
            body: payload,
            auth: false
        });
    },
    async register(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.auth.register,
            body: payload,
            auth: false
        });
    }
};
