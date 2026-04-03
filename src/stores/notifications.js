import { defineStore } from 'pinia';
import { notificationsApi } from '../api/notificationsApi';
/**
 * 跨页面共享通知列表与未读数：顶栏下拉、通知中心、登录后刷新保持一致。
 */
export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        items: [],
        unreadCount: 0,
        /** 最近一次完整列表拉取时间 */
        listFetchedAt: 0
    }),
    actions: {
        /** 拉全量列表并更新未读数 */
        async refreshList() {
            const list = await notificationsApi.getNotifications();
            this.items = list;
            this.unreadCount = list.filter((n) => !n.isRead).length;
            this.listFetchedAt = Date.now();
        },
        /** 仅刷新未读数（轻量，用于定时轮询） */
        async refreshUnreadCount() {
            this.unreadCount = await notificationsApi.getUnreadCount();
        },
        /** 列表接口返回的新列表（标已读/删除后由调用方传入） */
        applyListFromApi(list) {
            this.items = list;
            this.unreadCount = list.filter((n) => !n.isRead).length;
            this.listFetchedAt = Date.now();
        },
        clearLocal() {
            this.items = [];
            this.unreadCount = 0;
            this.listFetchedAt = 0;
        }
    }
});
