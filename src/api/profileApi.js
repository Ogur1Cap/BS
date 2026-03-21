import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const profileApi = {
    async getProfile() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.profile.detail, auth: true });
    },
    async updateProfile(payload) {
        return apiRequest({
            method: 'PUT',
            path: API_ENDPOINTS.profile.detail,
            auth: true,
            body: payload
        });
    }
};
