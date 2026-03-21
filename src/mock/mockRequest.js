import { mockDb } from './mockDb';
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function assertBody(body) {
    return body;
}
export async function mockRequest(options) {
    // 统一延迟，模拟真实网络
    await sleep(300);
    const { method, path } = options;
    // auth
    if (method === 'POST' && path === '/auth/login') {
        const { username } = assertBody(options.body);
        const updatedProfile = mockDb.profile.applyLoginUser(username);
        const res = {
            token: `delta_action_mock_token_${Date.now()}`,
            user: {
                username: updatedProfile.username,
                avatar: updatedProfile.avatar,
                email: updatedProfile.email,
                phone: updatedProfile.phone
            }
        };
        return res;
    }
    if (method === 'POST' && path === '/auth/register') {
        const { username, email } = assertBody(options.body);
        mockDb.profile.update({
            username: username.trim(),
            email: email.trim()
        });
        return { ok: true };
    }
    // notifications
    if (method === 'GET' && path === '/notifications') {
        const res = mockDb.notification.getAll();
        return res;
    }
    if (method === 'POST' && path === '/notifications/mark-read') {
        const { notificationId } = assertBody(options.body);
        const res = mockDb.notification.markAsRead(notificationId);
        return res;
    }
    if (method === 'POST' && path === '/notifications/mark-all-read') {
        const res = mockDb.notification.markAllAsRead();
        return res;
    }
    if (method === 'DELETE' && path.startsWith('/notifications/')) {
        const id = decodeURIComponent(path.split('/')[2] || '');
        const res = mockDb.notification.deleteOne(id);
        return res;
    }
    // orders
    if (method === 'GET' && path === '/orders') {
        const res = mockDb.orders.list();
        return res;
    }
    if (method === 'POST' && path === '/orders') {
        const payload = assertBody(options.body);
        const res = mockDb.orders.create(payload);
        return res;
    }
    if (method === 'POST' && path.endsWith('/cancel') && path.startsWith('/orders/')) {
        const orderId = decodeURIComponent(path.split('/')[2] || '');
        const res = mockDb.orders.cancel(orderId);
        return res;
    }
    if (method === 'GET' && path.startsWith('/orders/')) {
        const orderId = decodeURIComponent(path.split('/')[2] || '');
        const res = mockDb.orders.detail(orderId);
        if (!res)
            throw new Error(`Order not found: ${orderId}`);
        return res;
    }
    if (method === 'POST' && path.endsWith('/reschedule') && path.startsWith('/orders/')) {
        const orderId = decodeURIComponent(path.split('/')[2] || '');
        const body = assertBody(options.body);
        const res = mockDb.orders.reschedule(orderId, body.startTime);
        return res;
    }
    if (method === 'POST' && path.endsWith('/refund') && path.startsWith('/orders/')) {
        const orderId = decodeURIComponent(path.split('/')[2] || '');
        const body = assertBody(options.body);
        const res = mockDb.orders.refund(orderId, body.reason);
        return res;
    }
    // profile
    if (method === 'GET' && path === '/profile') {
        const res = mockDb.profile.get();
        return res;
    }
    if (method === 'PUT' && path === '/profile') {
        const payload = assertBody(options.body);
        const res = mockDb.profile.update(payload);
        return res;
    }
    // 如果未匹配到 mock 路由，直接抛错，方便你继续补齐接口
    throw new Error(`Mock: no handler for ${method} ${path}`);
}
