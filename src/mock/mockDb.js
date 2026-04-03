import notificationsSeed from './data/notifications.json';
import ordersSeed from './data/orders.json';
import profileSeed from './data/profile.json';
import { normalizePlayerProfileId } from '../utils/playerProfileId';
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
/** Mock 权限：0 顾客 / 1 打手（登录时按用户名切换） */
let mockUserLevel = 0;
let mockPlayerProfileId = null;
const initialSettings = {
    nickname: '三角洲精英',
    bio: profileSeedTyped.bio || '',
    notifyChannels: 'app,email',
    notifyTypes: 'order,system,message,security',
    wechat: 'wx_demo_bound',
    qq: '',
    weibo: ''
};
let accountSettings = clone(initialSettings);
let joinApplications = [];
let joinExtraHallPlayers = [];
const mockRevokedPlayerUsernames = new Set();
export const mockDb = {
    notification: {
        /** Mock：仅打手账号可见的新订单提醒（顾客登录时不展示） */
        pushPlayerOnlyOrder(title, content, relatedId) {
            const n = {
                id: `notif-p-${Date.now()}`,
                title,
                content,
                type: 'order',
                isRead: false,
                createdAt: new Date().toISOString(),
                relatedId,
                visibleFor: 'player'
            };
            notifications = [n, ...notifications];
        },
        getAll() {
            const lvl = mockUserLevel;
            return notifications.filter((n) => {
                const v = n.visibleFor;
                if (v == null || v === 'all')
                    return true;
                if (v === 'player')
                    return lvl >= 1;
                if (v === 'customer')
                    return lvl === 0;
                return true;
            });
        },
        markAsRead(notificationId) {
            const idx = notifications.findIndex((n) => n.id === notificationId);
            if (idx !== -1)
                notifications[idx].isRead = true;
            // 与 GET /notifications 一致，按当前登录角色过滤 visibleFor
            return mockDb.notification.getAll();
        },
        markAllAsRead() {
            notifications.forEach((n) => {
                n.isRead = true;
            });
            return mockDb.notification.getAll();
        },
        deleteOne(notificationId) {
            notifications = notifications.filter((n) => n.id !== notificationId);
            return mockDb.notification.getAll();
        },
        unreadCount() {
            return mockDb.notification.getAll().filter((n) => !n.isRead).length;
        }
    },
    orders: {
        list() {
            return [...orders];
        },
        cancel(orderId) {
            const idx = orders.findIndex((o) => o.id === orderId);
            if (idx !== -1) {
                if (!['pending', 'ongoing', 'completion_pending'].includes(orders[idx].status))
                    return [...orders];
                orders[idx].status = 'cancelled';
                orders[idx].statusText = '已取消';
            }
            return [...orders];
        },
        create(payload) {
            const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
            const npid = normalizePlayerProfileId(payload.playerId);
            const next = {
                id,
                game: payload.game,
                gameKey: payload.gameKey,
                gameImage: payload.gameImage,
                serviceType: payload.serviceType,
                status: 'pending',
                statusText: '待接单',
                amount: payload.amount,
                createdAt: new Date().toISOString(),
                startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                player: npid
                    ? {
                        id: npid,
                        name: payload.playerName || '指定打手',
                        avatar: 'https://picsum.photos/id/1005/40/40'
                    }
                    : null
            };
            orders = [next, ...orders];
            return [...orders];
        },
        detail(orderId) {
            return orders.find((item) => item.id === orderId) || null;
        },
        reschedule(orderId, startTime) {
            const idx = orders.findIndex((o) => o.id === orderId);
            if (idx !== -1) {
                if (!['pending', 'ongoing', 'completion_pending'].includes(orders[idx].status))
                    return [...orders];
                orders[idx].startTime = startTime;
                if (orders[idx].status === 'pending') {
                    orders[idx].status = 'ongoing';
                    orders[idx].statusText = '进行中';
                }
            }
            return [...orders];
        },
        refund(orderId, reason) {
            const idx = orders.findIndex((o) => o.id === orderId);
            if (idx !== -1) {
                if (orders[idx].status === 'cancelled')
                    return [...orders];
                orders[idx].status = 'cancelled';
                orders[idx].statusText = '已取消';
                orders[idx].refundRequested = true;
                orders[idx].refundReason = reason || '用户申请退款';
            }
            return [...orders];
        }
    },
    profile: {
        getUserLevel() {
            return mockUserLevel;
        },
        get() {
            return {
                ...profile,
                userLevel: mockUserLevel,
                playerProfileId: mockPlayerProfileId
            };
        },
        update(payload) {
            profile = {
                ...profile,
                ...payload
            };
            if (payload.bio !== undefined) {
                accountSettings = { ...accountSettings, bio: profile.bio };
            }
            return { ...profile };
        },
        applyLoginUser(username) {
            // 简化：根据登录的用户名更新个人资料展示字段
            const safeUsername = username.trim();
            const key = safeUsername.toLowerCase();
            // 打手演示：用户名或邮箱均可识别（与真实后端「用户名或邮箱登录」一致）
            const isBoss = key === 'boss_delta' || key === 'boss@demo.delta' || safeUsername === 'BOSS_Delta';
            const isPlayerDesk = key === 'dashou_yexi' || key === 'dashou_yexi@demo.delta' || safeUsername === 'DaShou_YeXi';
            mockUserLevel = isBoss ? 2 : isPlayerDesk ? 1 : 0;
            mockPlayerProfileId = isBoss ? null : isPlayerDesk ? '2' : null;
            profile = {
                ...profile,
                username: isBoss ? 'BOSS_Delta' : isPlayerDesk ? 'DaShou_YeXi' : safeUsername,
                email: isBoss
                    ? 'boss@demo.delta'
                    : isPlayerDesk
                        ? 'dashou_yexi@demo.delta'
                        : `user_${safeUsername.replace(/\s+/g, '').toLowerCase()}@example.com`
            };
            return mockDb.profile.get();
        }
    },
    accountSettings: {
        get() {
            return { ...accountSettings, bio: profile.bio };
        },
        update(payload) {
            accountSettings = { ...accountSettings, ...payload };
            if (payload.bio !== undefined) {
                profile = { ...profile, bio: payload.bio };
            }
            return { ...accountSettings, bio: profile.bio };
        }
    },
    joinUs: {
        hallExtras() {
            return [...joinExtraHallPlayers];
        },
        listPendingJoin() {
            return joinApplications.filter((a) => a.status === 'PENDING');
        },
        getMyJoin() {
            const u = profile.username;
            const mine = joinApplications.filter((a) => a.applicantUsername === u);
            if (!mine.length)
                return { hasApplication: false, application: null };
            const last = mine.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
            return { hasApplication: true, application: last };
        },
        submitJoin(payload) {
            if (mockUserLevel !== 0) {
                throw new Error('Mock: 仅顾客可申请成为打手');
            }
            const u = profile.username;
            if (joinApplications.some((a) => a.applicantUsername === u && a.status === 'PENDING')) {
                throw new Error('Mock: 您已有待审核的申请');
            }
            const id = `JOIN-${Date.now()}`;
            joinApplications.push({
                id,
                applicantUsername: u,
                displayName: payload.displayName.trim(),
                intro: payload.intro.trim(),
                skills: (payload.skills || '').trim(),
                rankName: (payload.rankName || '铂金').trim(),
                tags: (payload.tags || '').trim(),
                pricePerHour: typeof payload.pricePerHour === 'number' ? payload.pricePerHour : 99,
                contactNote: (payload.contactNote || '').trim(),
                status: 'PENDING',
                createdAt: new Date().toISOString()
            });
            return { ok: true, message: '申请已提交（Mock）', applicationId: id };
        },
        approveJoin(appId) {
            const app = joinApplications.find((a) => a.id === appId && a.status === 'PENDING');
            if (!app)
                return;
            app.status = 'APPROVED';
            const pid = String(500 + joinExtraHallPlayers.length + 1);
            joinExtraHallPlayers.push({
                id: pid,
                name: app.displayName,
                avatar: 'https://picsum.photos/id/1005/300/300',
                rank: 'platinum',
                rankText: app.rankName || '铂金',
                rankColor: '#64748b',
                skills: app.skills ? app.skills.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : ['综合护航'],
                winRate: 75,
                completedOrders: 0,
                rating: 4.6,
                pricePerHour: app.pricePerHour,
                intro: app.intro,
                tags: app.tags ? app.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : ['平台认证']
            });
        },
        rejectJoin(appId, reason) {
            const app = joinApplications.find((a) => a.id === appId && a.status === 'PENDING');
            if (!app)
                return;
            app.status = 'REJECTED';
            app.rejectReason = reason;
        },
        /** Mock 打手账号列表（供 BOSS 解除） */
        listMockPlayerAccounts() {
            const base = [
                {
                    userId: '902',
                    username: 'DaShou_YeXi',
                    email: 'dashou_yexi@demo.delta',
                    playerProfileId: '2',
                    playerName: '夜袭者（Mock）'
                }
            ];
            return base.filter((row) => !mockRevokedPlayerUsernames.has(String(row.username)));
        },
        /** 按 Mock 账号 userId 解除打手（演示：902 → DaShou_YeXi） */
        revokeByUserId(userId) {
            const map = [{ userId: '902', username: 'DaShou_YeXi' }].find((x) => String(x.userId) === userId);
            if (map) {
                mockRevokedPlayerUsernames.add(map.username);
                joinExtraHallPlayers = joinExtraHallPlayers.filter((p) => String(p.name) !== map.username);
            }
        }
    }
};
