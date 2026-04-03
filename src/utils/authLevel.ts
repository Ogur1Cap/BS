import { getAuthUser } from '../api/token'
import { useUserStore } from '../stores/user'

/** 合并本地缓存与 Pinia 中的 userLevel（刷新页面后以 store 为准） */
export function getEffectiveUserLevel(): number {
  const fromAuth = getAuthUser()?.userLevel
  if (typeof fromAuth === 'number' && fromAuth >= 0) {
    return fromAuth
  }
  try {
    const fromStore = useUserStore().profile?.userLevel
    return typeof fromStore === 'number' ? fromStore : 0
  } catch {
    return 0
  }
}

/** 仅打手工作台（1 级），不含 BOSS */
export function isPlayerAccount(): boolean {
  return getEffectiveUserLevel() === 1
}

/** 顾客（0 级） */
export function isCustomerAccount(): boolean {
  return getEffectiveUserLevel() === 0
}

/** 平台 BOSS（2 级及以上） */
export function isBossAccount(): boolean {
  return getEffectiveUserLevel() >= 2
}
