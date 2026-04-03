import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const missionBriefingApi = {
    async getToday() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.delta.missionBriefing,
            auth: true
        });
    }
};
