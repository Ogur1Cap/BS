import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const gameMapApi = {
    async listPois() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.gameMap.pois,
            auth: true
        });
    },
    async listMarkers() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.gameMap.markers,
            auth: true
        });
    },
    async addMarker(body) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.gameMap.markers,
            auth: true,
            body
        });
    },
    async updateMarker(markerId, body) {
        return apiRequest({
            method: 'PUT',
            path: API_ENDPOINTS.gameMap.marker(markerId),
            auth: true,
            body
        });
    },
    async deleteMarker(markerId) {
        return apiRequest({
            method: 'DELETE',
            path: API_ENDPOINTS.gameMap.marker(markerId),
            auth: true
        });
    }
};
