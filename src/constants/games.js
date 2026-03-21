export const GAME_LIST = [
    { id: 1, key: 'delta', name: '三角洲行动', imageUrl: 'https://picsum.photos/id/237/400/200' },
    { id: 2, key: 'pubg', name: '绝地求生', imageUrl: 'https://picsum.photos/id/238/400/200' },
    { id: 3, key: 'cod', name: '使命召唤', imageUrl: 'https://picsum.photos/id/239/400/200' },
    { id: 4, key: 'apex', name: 'Apex英雄', imageUrl: 'https://picsum.photos/id/240/400/200' }
];
export function getGameByKey(key) {
    return GAME_LIST.find((item) => item.key === key);
}
export function getGameByName(name) {
    return GAME_LIST.find((item) => item.name === name);
}
