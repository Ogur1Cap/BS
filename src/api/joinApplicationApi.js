import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const joinApplicationApi = {
    async submit(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.playerJoin.submit,
            auth: true,
            body: payload
        });
    },
    async getMy() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.playerJoin.me,
            auth: true
        });
    }
};
