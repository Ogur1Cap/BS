/*
 * 【API 模式切换】开发环境使用 Mock 数据，生产环境对接真实后端
 * 通过环境变量 VITE_API_MODE 控制：mock（默认）| real
 */
export type ApiMode = 'mock' | 'real'

const mode = (import.meta.env.VITE_API_MODE as ApiMode | undefined) || 'mock'

export function getApiMode(): ApiMode {
  return mode
}

export function isMockMode(): boolean {
  return getApiMode() === 'mock'
}

