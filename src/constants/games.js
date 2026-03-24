import deltaImg from '@/image/delta.png'
import pubgImg from '@/image/PUBG.webp'
import codImg from '@/image/COMD.jpg'
import apexImg from '@/image/Apex.jpg'

export const GAME_LIST = [
    { id: 1, key: 'delta', name: '三角洲行动', imageUrl: deltaImg },
    { id: 2, key: 'pubg', name: '绝地求生', imageUrl: pubgImg },
    { id: 3, key: 'cod', name: '使命召唤', imageUrl: codImg },
    { id: 4, key: 'apex', name: 'Apex英雄', imageUrl: apexImg }
];
export function getGameByKey(key) {
    return GAME_LIST.find((item) => item.key === key);
}
export function getGameByName(name) {
    return GAME_LIST.find((item) => item.name === name);
}
