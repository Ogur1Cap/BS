import { apiRequest, ApiError, getApiBaseUrl } from './request';
import { API_ENDPOINTS } from './endpoints';
import { isMockMode } from './apiMode';
import { getAuthToken } from './token';
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsDataURL(file);
    });
}
function unwrapData(data, status) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }
    const o = data;
    const c = o.code;
    if (c !== undefined && c !== null && c !== 0 && c !== 200 && c !== '0' && c !== '200') {
        throw new ApiError(o.message || '请求失败', status, data, c);
    }
    return o.data;
}
export const profileApi = {
    async getProfile() {
        return apiRequest({ method: 'GET', path: API_ENDPOINTS.profile.detail, auth: true });
    },
    async updateProfile(payload) {
        return apiRequest({
            method: 'PUT',
            path: API_ENDPOINTS.profile.detail,
            auth: true,
            body: payload
        });
    },
    /** 上传头像：真实环境 multipart；Mock 走 Base64 JSON 接口 */
    async uploadAvatar(file) {
        if (isMockMode()) {
            const dataUrl = await readFileAsDataUrl(file);
            return apiRequest({
                method: 'POST',
                path: API_ENDPOINTS.profile.avatarData,
                body: { dataUrl },
                auth: true
            });
        }
        const base = getApiBaseUrl().replace(/\/$/, '');
        const token = getAuthToken();
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${base}${API_ENDPOINTS.profile.avatar}`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd
        });
        const text = await res.text();
        const parsed = text ? JSON.parse(text) : null;
        if (!res.ok) {
            const msg = parsed && typeof parsed === 'object' && 'message' in parsed
                ? String(parsed.message || '')
                : '';
            throw new ApiError(msg || '上传失败', res.status, parsed);
        }
        return unwrapData(parsed, res.status);
    },
    async changePassword(currentPassword, newPassword) {
        return apiRequest({
            method: 'POST',
            path: API_ENDPOINTS.profile.changePassword,
            auth: true,
            body: { currentPassword, newPassword }
        });
    }
};
