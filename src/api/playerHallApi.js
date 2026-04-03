import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const playerHallApi = {
    async listPlayers() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.playerHall.players,
            auth: true
        });
    }
};
