import { getApiBaseUrl } from './request';
/**
 * 将后端返回的相对路径（如 /uploads/avatars/xxx.png）转为浏览器可请求的绝对地址。
 */
export function resolvePublicFileUrl(path) {
    const p = path.trim();
    if (!p)
        return '';
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
        return p;
    }
    const base = getApiBaseUrl().replace(/\/$/, '');
    const rel = p.startsWith('/') ? p : `/${p}`;
    if (!base) {
        // 未配置 API 基址时退回当前站点（开发环境多为 Vite 代理场景，可按需再改）
        return `${window.location.origin}${rel}`;
    }
    return `${base}${rel}`;
}
