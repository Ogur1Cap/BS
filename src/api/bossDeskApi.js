import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const bossDeskApi = {
    async getStats() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.stats,
            auth: true
        });
    },
    async listCompletionPending() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.completionPending,
            auth: true
        });
    },
    async listManageable() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.manageable,
            auth: true
        });
    },
    async listPlayers() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.players,
            auth: true
        });
    },
    async approveCompletion(orderId) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.approveCompletion(orderId),
            auth: true
        });
    },
    async rejectCompletion(orderId, reason) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.rejectCompletion(orderId),
            auth: true,
            body: reason ? { reason } : {}
        });
    },
    async reassignOrder(orderId, targetPlayerId, remark) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.reassign(orderId),
            auth: true,
            body: { targetPlayerId, remark }
        });
    },
    async listJoinPending() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.joinPending,
            auth: true
        });
    },
    async approveJoin(applicationId) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.joinApprove(applicationId),
            auth: true
        });
    },
    async rejectJoin(applicationId, reason) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.joinReject(applicationId),
            auth: true,
            body: reason ? { reason } : {}
        });
    },
    async listPlayerAccounts() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.bossDesk.playerAccounts,
            auth: true
        });
    },
    async revokePlayer(userId) {
        await apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.bossDesk.revokePlayer(userId),
            auth: true
        });
    }
};
