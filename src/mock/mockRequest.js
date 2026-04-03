import { mockDb } from './mockDb';
/**
 * Mock 打手大厅：与库种子 players.id=1..5 及 `/player-hall/players` 真实接口字段一致，
 * 避免「p2」与打手档案主键「2」不一致导致工作台无单。
 */
const MOCK_HALL_PLAYERS = [
    {
        id: '1',
        name: '三角洲-猎鹰',
        avatar: 'https://picsum.photos/id/1012/300/300',
        rank: 'legend',
        rankText: '传奇',
        rankColor: '#f59e0b',
        skills: ['战术指挥', '精准狙击', '段位冲刺'],
        winRate: 82,
        completedOrders: 1246,
        rating: 4.9,
        pricePerHour: 180,
        intro: '5 年三角洲行动经验，擅长指挥与高难度局，支持全程录屏。',
        tags: ['全程直播', '胜率保障', '段位包过']
    },
    {
        id: '2',
        name: '夜袭者',
        avatar: 'https://picsum.photos/id/1025/300/300',
        rank: 'master',
        rankText: '大师',
        rankColor: '#8b5cf6',
        skills: ['突击攻坚', '装备获取', '快速推进'],
        winRate: 78,
        completedOrders: 987,
        rating: 4.8,
        pricePerHour: 150,
        intro: '专注物资点清缴与突击推进，效率高、沟通清晰。',
        tags: ['装备速刷', '突击专精', '高效完成']
    },
    {
        id: '3',
        name: '战术大师-凯',
        avatar: 'https://picsum.photos/id/1074/300/300',
        rank: 'diamond',
        rankText: '钻石',
        rankColor: '#3b82f6',
        skills: ['战术指挥', '新手指导', '特殊任务'],
        winRate: 75,
        completedOrders: 856,
        rating: 4.7,
        pricePerHour: 130,
        intro: '擅长带新手熟悉地图与机制，耐心讲解每一步决策。',
        tags: ['新手友好', '战术教学', '耐心指导']
    },
    {
        id: '4',
        name: '狙神-零度',
        avatar: 'https://picsum.photos/id/1062/300/300',
        rank: 'legend',
        rankText: '传奇',
        rankColor: '#f59e0b',
        skills: ['精准狙击', '远程压制', '点位控制'],
        winRate: 85,
        completedOrders: 762,
        rating: 4.9,
        pricePerHour: 200,
        intro: '远程架点与信息位专精，适合需要控场的队伍。',
        tags: ['狙击专精', '远程压制', '高命中率']
    },
    {
        id: '5',
        name: '突击手-狂狼',
        avatar: 'https://picsum.photos/id/1084/300/300',
        rank: 'master',
        rankText: '大师',
        rankColor: '#8b5cf6',
        skills: ['突击攻坚', '近战格斗', '快速清场'],
        winRate: 76,
        completedOrders: 632,
        rating: 4.6,
        pricePerHour: 140,
        intro: '近战突破与清房能力强，适合快节奏对局。',
        tags: ['近战专精', '快速清场', '敢打敢冲']
    }
];
/** Mock：帮助中心 FAQ（与后端种子数据语义一致） */
const MOCK_FAQS = [
    { id: '1', category: 'order', question: '怎么修改护航订单时间？', answer: '进入「我的订单」→ 找到对应订单→ 点击「修改时间」→ 选择新时间提交（已接单需先和打手确认）。' },
    { id: '2', category: 'order', question: '订单能取消退款吗？', answer: '未接单：直接取消，全额退款（1-3 个工作日到账）；已接单未开始：可能收取少量手续费；已开始：按完成比例协商退款。' },
    { id: '3', category: 'order', question: '订单「待接单」要等多久？', answer: '通常 10–30 分钟内会有打手接单；超时可在订单页尝试加急或联系客服协调匹配。' },
    { id: '4', category: 'service', question: '护航会导致账号被封吗？', answer: '平台要求打手手动操作、拒绝作弊工具；请使用临时密码并在服务结束后及时修改，可降低风险。' },
    { id: '5', category: 'service', question: '能指定打手吗？', answer: '可以：在「打手大厅」选择打手发起预约；或在下单备注中写明打手昵称，客服会协助撮合。' },
    { id: '6', category: 'service', question: '装备代刷没刷到怎么办？', answer: '请保留对局记录与截图联系客服核实；未履约部分可按规则退款或协商补刷。' },
    { id: '7', category: 'account', question: '给打手账号，怎么保证安全？', answer: '建议：使用临时密码；服务期间避免多端互顶；结束后立即改密并开启官方安全保护。' },
    { id: '8', category: 'account', question: '账号被冻结了怎么办？', answer: '区分游戏官方冻结与平台风控：官方按游戏内指引申诉；平台冻结可联系客服提交材料复核。' },
    { id: '9', category: 'account', question: '忘记密码怎么找？', answer: '登录页使用「忘记密码」通过绑定手机/邮箱重置；若未绑定请联系人工客服核验身份后处理。' }
];
/** Mock：地图自定义标记（仅 mock 模式下的内存状态） */
let mockMapMarkers = [];
/** Mock：打手工作台待接单 / 服务中（内存） */
let mockDeskPending = [
    {
        id: 'MOCK-ORD-001',
        game: '三角洲行动',
        gameKey: 'delta',
        gameImage: '',
        serviceType: '机密护航',
        status: 'PENDING',
        statusText: '待接单',
        amount: 168,
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
        startTime: null,
        customerUsername: '演示顾客',
        player: { id: '2', name: '夜袭者' }
    }
];
/** 服务中 / 待审核完成（与后端状态字符串一致便于联调） */
let mockDeskServing = [
    {
        id: 'MOCK-ORD-SRV',
        game: '三角洲行动',
        gameKey: 'delta',
        gameImage: '',
        serviceType: '机密护航',
        status: 'IN_PROGRESS',
        statusText: '进行中',
        amount: 168,
        createdAt: new Date(Date.now() - 7200_000).toISOString(),
        startTime: new Date(Date.now() + 3600_000).toISOString(),
        customerUsername: '演示顾客',
        player: { id: '2', name: '夜袭者' },
        completionRequestNote: null
    }
];
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
                phone: updatedProfile.phone,
                userLevel: updatedProfile.userLevel ?? 0
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
    if (method === 'GET' && path === '/notifications/unread-count') {
        return { count: mockDb.notification.unreadCount() };
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
        const list = mockDb.orders.create(payload);
        const created = list[0];
        // 指定打手时：同步打手工作台待接单 + 打手可见通知（与真实后端行为对齐）
        if (created?.player?.id) {
            const prof = mockDb.profile.get();
            mockDeskPending.unshift({
                id: created.id,
                game: created.game,
                gameKey: created.gameKey,
                gameImage: created.gameImage || '',
                serviceType: created.serviceType,
                status: 'PENDING',
                statusText: '待接单',
                amount: created.amount,
                createdAt: created.createdAt,
                startTime: created.startTime ?? null,
                customerUsername: prof.username,
                player: { id: created.player.id, name: created.player.name }
            });
            mockDb.notification.pushPlayerOnlyOrder('新订单待接单', `顾客 ${prof.username} 指定您接单：${created.game} · ${created.serviceType}，金额 ¥${created.amount}。`, created.id);
        }
        return list;
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
    if (method === 'POST' && path === '/profile/avatar-data') {
        const { dataUrl } = assertBody(options.body);
        mockDb.profile.update({ avatar: dataUrl });
        return { url: dataUrl };
    }
    if (method === 'POST' && path === '/profile/change-password') {
        assertBody(options.body);
        return undefined;
    }
    if (method === 'GET' && path === '/account-settings') {
        return mockDb.accountSettings.get();
    }
    if (method === 'PUT' && path === '/account-settings') {
        const payload = assertBody(options.body);
        const res = mockDb.accountSettings.update(payload);
        return res;
    }
    // 帮助中心
    if (method === 'GET' && path === '/help-center/faqs') {
        const cat = options.query?.category;
        const list = cat === undefined || cat === ''
            ? MOCK_FAQS
            : MOCK_FAQS.filter((f) => f.category === String(cat));
        return list;
    }
    // 客服工单
    if (method === 'POST' && path === '/support-center/tickets') {
        const id = `MOCK-${Date.now()}`;
        return { id, status: 'QUEUED' };
    }
    // 打手大厅（种子 1..5 + 入驻审核通过后追加的打手）
    if (method === 'GET' && path === '/player-hall/players') {
        const rows = [...MOCK_HALL_PLAYERS, ...mockDb.joinUs.hallExtras()];
        return rows;
    }
    // 加入我们（入驻申请）
    if (method === 'POST' && path === '/player-join-applications') {
        const body = assertBody(options.body || {});
        const res = mockDb.joinUs.submitJoin(body);
        return res;
    }
    if (method === 'GET' && path === '/player-join-applications/me') {
        const my = mockDb.joinUs.getMyJoin();
        if (!my.hasApplication || !my.application) {
            return { hasApplication: false, application: null };
        }
        const a = my.application;
        return {
            hasApplication: true,
            application: {
                id: a.id,
                status: a.status,
                displayName: a.displayName,
                intro: a.intro,
                skills: a.skills,
                rankName: a.rankName,
                tags: a.tags,
                pricePerHour: a.pricePerHour,
                contactNote: a.contactNote,
                createdAt: a.createdAt,
                rejectReason: a.rejectReason
            }
        };
    }
    // 游戏地图 POI
    if (method === 'GET' && path === '/game-map/pois') {
        const pois = [
            { id: 'p1', name: '行政补给站', x: 360, y: 250, floor: 1, type: 'resource', modes: ['normal', 'attack'], security: ['normal', 'secret'] },
            { id: 'p2', name: '观察塔出生点', x: 210, y: 780, floor: 1, type: 'spawn', modes: ['normal', 'occupy'], security: ['normal', 'secret', 'top-secret'] },
            { id: 'p3', name: '下水道撤离点', x: 1460, y: 1020, floor: 1, type: 'extract', modes: ['normal'], security: ['normal', 'secret'] }
        ];
        return pois;
    }
    if (method === 'GET' && path === '/game-map/markers') {
        return [...mockMapMarkers];
    }
    if (method === 'POST' && path === '/game-map/markers') {
        const b = assertBody(options.body);
        const id = `mk_${Date.now()}`;
        mockMapMarkers = [{ id, x: b.x, y: b.y, label: b.label, note: b.note ?? '' }, ...mockMapMarkers];
        return [...mockMapMarkers];
    }
    if (method === 'PUT' && path.startsWith('/game-map/markers/')) {
        const id = decodeURIComponent(path.split('/')[3] || '');
        const b = assertBody(options.body);
        mockMapMarkers = mockMapMarkers.map((m) => m.id === id ? { ...m, label: b.label ?? m.label, note: b.note ?? m.note } : m);
        return [...mockMapMarkers];
    }
    if (method === 'DELETE' && path.startsWith('/game-map/markers/')) {
        const id = decodeURIComponent(path.split('/')[3] || '');
        mockMapMarkers = mockMapMarkers.filter((m) => m.id !== id);
        return [...mockMapMarkers];
    }
    // —— 打手工作台（Mock：需使用用户名 DaShou_YeXi 登录） ——
    const assertPlayerMock = () => {
        if (mockDb.profile.getUserLevel() !== 1) {
            throw new Error('Mock: 打手工作台需要打手账号（1 级），请使用 DaShou_YeXi 登录（任意密码）');
        }
    };
    const assertBossMock = () => {
        if (mockDb.profile.getUserLevel() < 2) {
            throw new Error('Mock: BOSS 控制台需要 BOSS 账号，请使用 BOSS_Delta 登录（任意密码）');
        }
    };
    const mockBossPlayers = () => {
        const extra = mockDb.joinUs.hallExtras().map((p) => {
            const o = p;
            return {
                id: Number(o.id),
                name: String(o.name || ''),
                avatar: String(o.avatar || '')
            };
        });
        return [
            { id: 1, name: '三角洲-猎鹰', avatar: '' },
            { id: 2, name: '夜袭者', avatar: '' },
            { id: 3, name: '战术大师-凯', avatar: '' },
            { id: 4, name: '狙神-零度', avatar: '' },
            { id: 5, name: '突击手-狂狼', avatar: '' },
            ...extra
        ];
    };
    const toBossRow = (row) => ({
        ...row,
        userId: '1',
        customerUsername: row.customerUsername || '演示顾客'
    });
    if (method === 'GET' && path === '/player-desk/stats') {
        assertPlayerMock();
        return {
            pendingCount: mockDeskPending.length,
            servingCount: mockDeskServing.length,
            completedWeekCount: 3,
            playerProfileId: '2',
            displayHint: '接单后请及时与顾客确认上号时间；拒单将通知顾客重新匹配。'
        };
    }
    if (method === 'GET' && path === '/player-desk/orders/pending') {
        assertPlayerMock();
        return [...mockDeskPending];
    }
    if (method === 'GET' && path === '/player-desk/orders/serving') {
        assertPlayerMock();
        return [...mockDeskServing];
    }
    if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/accept')) {
        assertPlayerMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 2] || '';
        const idx = mockDeskPending.findIndex((o) => o.id === oid);
        if (idx >= 0) {
            const [row] = mockDeskPending.splice(idx, 1);
            const next = {
                ...row,
                status: 'IN_PROGRESS',
                statusText: '进行中',
                startTime: new Date().toISOString()
            };
            mockDeskServing.unshift(next);
        }
        return [...mockDeskPending];
    }
    if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/reject')) {
        assertPlayerMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 2] || '';
        mockDeskPending = mockDeskPending.filter((o) => o.id !== oid);
        return [...mockDeskPending];
    }
    if (method === 'POST' && path.includes('/player-desk/orders/') && path.endsWith('/complete-request')) {
        assertPlayerMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 2] || '';
        const body = assertBody(options.body || {});
        const idx = mockDeskServing.findIndex((o) => String(o.id) === oid);
        if (idx >= 0) {
            const row = mockDeskServing[idx];
            if (String(row.status) !== 'IN_PROGRESS') {
                throw new Error('Mock: 仅进行中的订单可申请完成');
            }
            row.status = 'COMPLETION_PENDING';
            row.statusText = '待审核完成';
            row.completionRequestNote = body.note?.trim() || '';
        }
        return [...mockDeskServing];
    }
    if (method === 'GET' && path === '/boss-desk/stats') {
        assertBossMock();
        return {
            pendingCompletionCount: mockDeskServing.filter((o) => o.status === 'COMPLETION_PENDING').length,
            manageableOrderCount: mockDeskPending.length + mockDeskServing.length,
            pendingJoinCount: mockDb.joinUs.listPendingJoin().length,
            displayHint: '审核打手完成申请时请核对履约情况；转派订单务必填写备注，顾客将收到通知。'
        };
    }
    if (method === 'GET' && path === '/boss-desk/orders/completion-pending') {
        assertBossMock();
        return mockDeskServing.filter((o) => o.status === 'COMPLETION_PENDING').map(toBossRow);
    }
    if (method === 'GET' && path === '/boss-desk/orders/manageable') {
        assertBossMock();
        const merged = [...mockDeskPending, ...mockDeskServing].map((r) => toBossRow({ ...r }));
        return merged;
    }
    if (method === 'GET' && path === '/boss-desk/players') {
        assertBossMock();
        return mockBossPlayers();
    }
    if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/completion/approve')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 3] || '';
        mockDeskServing = mockDeskServing.filter((o) => String(o.id) !== oid);
        return undefined;
    }
    if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/completion/reject')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 3] || '';
        const body = assertBody(options.body || {});
        const row = mockDeskServing.find((o) => String(o.id) === oid);
        if (row && row.status === 'COMPLETION_PENDING') {
            row.status = 'IN_PROGRESS';
            row.statusText = '进行中';
            row.completionRequestNote = null;
        }
        return undefined;
    }
    if (method === 'POST' && path.includes('/boss-desk/orders/') && path.endsWith('/reassign')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const oid = segs[segs.length - 2] || '';
        const body = assertBody(options.body || {});
        if (!body.remark?.trim())
            throw new Error('Mock: 转派需填写备注');
        const pid = body.targetPlayerId;
        if (pid == null)
            throw new Error('Mock: 缺少 targetPlayerId');
        const pl = mockBossPlayers().find((p) => p.id === pid);
        const name = pl?.name || `打手#${pid}`;
        const inPending = mockDeskPending.findIndex((o) => String(o.id) === oid);
        if (inPending >= 0) {
            const row = mockDeskPending[inPending];
            row.player = { id: String(pid), name };
            return undefined;
        }
        const inServing = mockDeskServing.findIndex((o) => String(o.id) === oid);
        if (inServing >= 0) {
            const row = mockDeskServing[inServing];
            row.player = { id: String(pid), name };
            if (row.status === 'COMPLETION_PENDING') {
                row.status = 'IN_PROGRESS';
                row.statusText = '进行中';
                row.completionRequestNote = null;
            }
            return undefined;
        }
        throw new Error('Mock: 订单不存在');
    }
    if (method === 'GET' && path === '/boss-desk/join-applications/pending') {
        assertBossMock();
        return mockDb.joinUs.listPendingJoin().map((a) => ({
            id: a.id,
            status: a.status,
            displayName: a.displayName,
            intro: a.intro,
            skills: a.skills,
            rankName: a.rankName,
            tags: a.tags,
            pricePerHour: a.pricePerHour,
            contactNote: a.contactNote,
            createdAt: a.createdAt,
            applicantUsername: a.applicantUsername,
            applicantEmail: `mock_${a.applicantUsername}@local`
        }));
    }
    if (method === 'POST' && path.includes('/boss-desk/join-applications/') && path.endsWith('/approve')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const aid = segs[segs.length - 2] || '';
        mockDb.joinUs.approveJoin(aid);
        return undefined;
    }
    if (method === 'POST' && path.includes('/boss-desk/join-applications/') && path.endsWith('/reject')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const aid = segs[segs.length - 2] || '';
        const body = assertBody(options.body || {});
        mockDb.joinUs.rejectJoin(aid, body.reason?.trim() || '未说明');
        return undefined;
    }
    if (method === 'GET' && path === '/boss-desk/player-accounts') {
        assertBossMock();
        return mockDb.joinUs.listMockPlayerAccounts();
    }
    if (method === 'POST' && path.includes('/boss-desk/player-accounts/') && path.endsWith('/revoke')) {
        assertBossMock();
        const segs = path.split('/').filter(Boolean);
        const uid = segs[segs.length - 2] || '';
        mockDb.joinUs.revokeByUserId(uid);
        return undefined;
    }
    // 今日行动简报
    if (method === 'GET' && path === '/delta/mission-briefing') {
        const briefing = {
            title: '今日行动简报',
            mapName: '零号大坝',
            date: new Date().toISOString().slice(0, 10),
            tip: '开局先听枪声方向，避免盲冲开阔地；撤离前留一条备用路线。',
            tag: '战术提示'
        };
        return briefing;
    }
    // 如果未匹配到 mock 路由，直接抛错，方便你继续补齐接口
    throw new Error(`Mock: no handler for ${method} ${path}`);
}
