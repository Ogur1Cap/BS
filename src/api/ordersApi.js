import { apiRequest } from './request';
import { API_ENDPOINTS } from './endpoints';
export const ordersApi = {
    async listOrders() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.orders.list, auth: true });
    },
    async createOrder(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.orders.create,
            auth: true,
            body: payload
        });
    },
    async getOrderDetail(orderId) {
        return apiRequest({
            method: 'GET',
            path: API_ENDPOINTS.orders.detail(orderId),
            auth: true
        });
    },
    async rescheduleOrder(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.orders.reschedule(payload.orderId),
            auth: true,
            body: payload
        });
    },
    async refundOrder(payload) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.orders.refund(payload.orderId),
            auth: true,
            body: payload
        });
    },
    async cancelOrder(orderId) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.orders.cancel(orderId),
            auth: true,
            body: { orderId }
        });
    }
};
