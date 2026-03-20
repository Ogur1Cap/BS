export function getAuthToken() {
    return localStorage.getItem('delta_token') || sessionStorage.getItem('delta_token') || '';
}
export function getAuthUser() {
    const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
    if (!userStr)
        return null;
    try {
        return JSON.parse(userStr);
    }
    catch {
        return null;
    }
}
