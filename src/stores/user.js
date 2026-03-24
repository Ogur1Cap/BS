import { defineStore } from 'pinia';
import { profileApi } from '../api/profileApi';
import { accountSettingsApi } from '../api/accountSettingsApi';
import { getAuthUser, setAuthUser } from '../api/token';
import { resolvePublicFileUrl } from '../api/publicUrl';
const DEFAULT_AVATAR = 'https://picsum.photos/id/237/200/200';
function normalizeSettings(raw) {
    const r = raw;
    return {
        nickname: String(r.nickname ?? ''),
        bio: String(r.bio ?? ''),
        notifyChannels: String(r.notifyChannels ?? 'app,email'),
        notifyTypes: String(r.notifyTypes ?? 'order,system,message'),
        wechat: String(r.wechat ?? ''),
        qq: String(r.qq ?? ''),
        weibo: String(r.weibo ?? '')
    };
}
export const useUserStore = defineStore('user', {
    state: () => ({
        profile: null,
        settings: null
    }),
    getters: {
        /** 导航栏等展示名：优先昵称 */
        displayName() {
            const nick = this.settings?.nickname?.trim();
            if (nick)
                return nick;
            const u = this.profile?.username?.trim();
            if (u)
                return u;
            return getAuthUser()?.username?.trim() || '用户';
        },
        /** 已解析为可请求的完整头像地址 */
        resolvedAvatarUrl() {
            const raw = this.profile?.avatar?.trim();
            if (!raw) {
                const cached = getAuthUser()?.avatar?.trim();
                return cached || DEFAULT_AVATAR;
            }
            if (raw.startsWith('data:') || raw.startsWith('http://') || raw.startsWith('https://')) {
                return raw;
            }
            return resolvePublicFileUrl(raw) || DEFAULT_AVATAR;
        }
    },
    actions: {
        rememberFlag() {
            return !!localStorage.getItem('delta_token');
        },
        persistToAuthStorage() {
            if (!this.profile)
                return;
            setAuthUser({
                username: this.profile.username,
                email: this.profile.email,
                phone: this.profile.phone,
                nickname: this.settings?.nickname?.trim() || undefined,
                avatar: this.resolvedAvatarUrl
            }, this.rememberFlag());
        },
        /** 登录后或 App 启动时拉取服务端资料与账户设置 */
        async loadUserFromServer() {
            const prof = await profileApi.getProfile();
            this.profile = prof;
            try {
                const raw = await accountSettingsApi.get();
                this.settings = normalizeSettings(raw);
            }
            catch {
                if (!this.settings) {
                    this.settings = normalizeSettings({ bio: prof.bio });
                }
            }
            if (this.settings && !this.settings.bio.trim() && prof.bio) {
                this.settings = { ...this.settings, bio: prof.bio };
            }
            this.persistToAuthStorage();
        },
        async saveProfile(payload) {
            const updated = await profileApi.updateProfile(payload);
            this.profile = { ...this.profile, ...updated };
            if (this.settings && payload.bio !== undefined) {
                this.settings = { ...this.settings, bio: updated.bio };
            }
            this.persistToAuthStorage();
            return updated;
        },
        async saveAccountSettings(payload) {
            const updated = await accountSettingsApi.update(payload);
            this.settings = normalizeSettings(updated);
            if (payload.bio !== undefined && this.profile) {
                this.profile = { ...this.profile, bio: this.settings.bio };
            }
            this.persistToAuthStorage();
            return this.settings;
        },
        /** 选择图片后立即上传并写库，保证各页头像一致 */
        async uploadAvatarFile(file) {
            const { url } = await profileApi.uploadAvatar(file);
            await this.saveProfile({ avatar: url });
        },
        clear() {
            this.profile = null;
            this.settings = null;
        }
    }
});
