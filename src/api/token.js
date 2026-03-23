const TOKEN_KEY = 'delta_token';
const USER_KEY = 'delta_user';
function readFromStorages(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || '';
}
function writeToStorage(key, value, remember) {
    if (remember) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
        return;
    }
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
}
export function getAuthToken() {
    return readFromStorages(TOKEN_KEY);
}
export function setAuthToken(token, remember) {
    writeToStorage(TOKEN_KEY, token, remember);
}
export function removeAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}
export function getAuthUser() {
    const userStr = readFromStorages(USER_KEY);
    if (!userStr)
        return null;
    try {
        return JSON.parse(userStr);
    }
    catch {
        return null;
    }
}
export function setAuthUser(user, remember) {
    writeToStorage(USER_KEY, JSON.stringify(user), remember);
}
export function removeAuthUser() {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
}
