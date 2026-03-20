const mode = import.meta.env.VITE_API_MODE || 'mock';
export function getApiMode() {
    return mode;
}
export function isMockMode() {
    return getApiMode() === 'mock';
}
