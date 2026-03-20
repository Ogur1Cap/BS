import { isMockMode } from './apiMode';
import { getAuthToken } from './token';
import { mockRequest } from '../mock/mockRequest';
export class ApiError extends Error {
    status;
    data;
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}
function buildUrl(path, query) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const url = new URL(path, baseUrl || window.location.origin);
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
        throw new ApiError('Request failed', res.status, data);
    }
    return data;
}
