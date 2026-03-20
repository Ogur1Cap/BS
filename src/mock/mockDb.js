import notificationsSeed from './data/notifications.json';
import ordersSeed from './data/orders.json';
import profileSeed from './data/profile.json';
function clone(v) {
    return JSON.parse(JSON.stringify(v));
}
// JSON 在 TS 中默认推断为 string/unions 不严格，这里显式断言到业务类型。
const notificationsSeedTyped = notificationsSeed;
const ordersSeedTyped = ordersSeed;
const profileSeedTyped = profileSeed;
let notifications = clone(notificationsSeedTyped);
let orders = clone(ordersSeedTyped);
let profile = clone(profileSeedTyped);
export const mockDb = {
    notification: {
        getAll() {
            return [...notifications];
        },
        markAsRead(notificationId) {
            const idx = notifications.findIndex((n) => n.id === notificationId);
            if (idx !== -1)
                notifications[idx].isRead = true;
            return [...notifications];
        },
        markAllAsRead() {
            notifications.forEach((n) => {
                n.isRead = true;
            });
            return [...notifications];
        },
        deleteOne(notificationId) {
            notifications = notifications.filter((n) => n.id !== notificationId);
            return [...notifications];
        }
    },
    orders: {
        list() {
            return [...orders];
        },
        cancel(orderId) {
            const idx = orders.findIndex((o) => o.id === orderId);
            if (idx !== -1) {
                orders[idx].status = 'cancelled';
                orders[idx].statusText = '已取消';
            }
            return [...orders];
        }
    },
    profile: {
        get() {
            return { ...profile };
        },
        update(payload) {
            profile = {
                ...profile,
                ...payload
            };
            return { ...profile };
        },
        applyLoginUser(username) {
            // 简化：根据登录的用户名更新个人资料展示字段
            const safeUsername = username.trim();
            profile = {
                ...profile,
                username: safeUsername,
                email: `user_${safeUsername.replace(/\s+/g, '').toLowerCase()}@example.com`
            };
            return { ...profile };
        }
    }
};
