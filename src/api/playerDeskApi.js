import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const playerDeskApi = {
    async getStats() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.playerDesk.stats,
            auth: true
        });
    },
    async listPending() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.playerDesk.pendingOrders,
            auth: true
        });
    },
    async listServing() {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.playerDesk.servingOrders,
            auth: true
        });
    },
    async acceptOrder(orderId) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.playerDesk.accept(orderId),
            auth: true
        });
    },
    async rejectOrder(orderId, reason) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.playerDesk.reject(orderId),
            auth: true,
            body: reason ? { reason } : {}
        });
    },
    /** 申请订单完成（进入待 BOSS 审核） */
    async requestOrderComplete(orderId, note) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.playerDesk.completeRequest(orderId),
            auth: true,
            body: note ? { note } : {}
        });
    }
};
