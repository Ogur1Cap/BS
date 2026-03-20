import { apiRequest } from './apiClient';
export const ordersApi = {
    async listOrders() {
        return apiRequest({ method: 'GET', path: '/orders', auth: true });
    },
    async cancelOrder(orderId) {
        return apiRequest({
            method: 'POST',
            path: `/orders/${encodeURIComponent(orderId)}/cancel`,
            auth: true,
            body: { orderId }
        });
    }
};
