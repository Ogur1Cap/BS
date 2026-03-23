import { isMockMode } from './apiMode';
import { getAuthToken, removeAuthToken, removeAuthUser } from './token';
import { mockRequest } from '../mock/mockRequest';
export class ApiError extends Error {
    status;
    code;
    data;
    constructor(message, status, data, code) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.data = data;
    }
}
// 统一域名入口：后续接入后端只需改 VITE_API_BASE_URL。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '';
export function getApiBaseUrl() {
    return API_BASE_URL;
}
function isWrappedResponse(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    return 'code' in value || 'message' in value || 'data' in value;
}
function isBusinessSuccessCode(code) {
    return code === 0 || code === 200 || code === '0' || code === '200';
}
function buildRedirectLoginUrl() {
    const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return `/login?redirect=${encodeURIComponent(redirect)}`;
}
function handleUnauthorized() {
    removeAuthToken();
    removeAuthUser();
    if (window.location.pathname !== '/login') {
        window.location.replace(buildRedirectLoginUrl());
    }
}
function unwrapResponseData(payload, status) {
    if (!isWrappedResponse(payload)) {
        return payload;
    }
    const responseCode = payload.code;
    const responseMessage = payload.message || '请求失败';
    if (responseCode === undefined || responseCode === null || isBusinessSuccessCode(responseCode)) {
        return payload.data;
    }
    throw new ApiError(responseMessage, status, payload, responseCode);
}
function buildUrl(path, query) {
    const url = new URL(path, getApiBaseUrl() || window.location.origin);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v === undefined)
                continue;
            url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}
export async function apiRequest(options) {
    if (isMockMode()) {
        return mockRequest(options);
    }
    const url = buildUrl(options.path, options.query);
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (options.auth) {
        const token = getAuthToken();
        if (token)
            headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, {
        method: options.method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const text = await res.text();
    const data = text ? (() => {
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    })() : null;
    if (!res.ok) {
        const backendMessage = (data && typeof data === 'object' && 'message' in data
            ? data.message
            : undefined);
        const errorMessage = typeof backendMessage === 'string' && backendMessage.trim()
            ? backendMessage
            : 'Request failed';
        if (res.status === 401) {
            handleUnauthorized();
        }
        throw new ApiError(errorMessage, res.status, data);
    }
    const unwrapped = unwrapResponseData(data, res.status);
    return unwrapped;
}
