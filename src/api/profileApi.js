import { apiRequest } from './apiClient';
export const profileApi = {
    async getProfile() {
        return apiRequest({ method: 'GET', path: '/profile', auth: true });
    },
    async updateProfile(payload) {
        return apiRequest({
            method: 'PUT',
            path: '/profile',
            auth: true,
            body: payload
        });
    }
};
