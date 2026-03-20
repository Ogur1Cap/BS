import { apiRequest } from './apiClient';
export const authApi = {
    async login(payload) {
        return apiRequest({
            method: 'POST',
            path: '/auth/login',
            body: payload,
            auth: false
        });
    },
    async register(payload) {
        return apiRequest({
            method: 'POST',
            path: '/auth/register',
            body: payload,
            auth: false
        });
    }
};
