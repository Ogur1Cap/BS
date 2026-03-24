import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const accountSettingsApi = {
    async get() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.accountSettings.root, auth: true });
    },
    async update(payload) {
        return apiRequest({
            method: 'PUT',
            path: API_ENDPOINTS.accountSettings.root,
            auth: true,
            body: payload
        });
    }
};
