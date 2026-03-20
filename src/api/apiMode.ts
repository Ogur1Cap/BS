export type ApiMode = 'mock' | 'real'

const mode = (import.meta.env.VITE_API_MODE as ApiMode | undefined) || 'mock'

export function getApiMode(): ApiMode {
  return mode
}

export function isMockMode(): boolean {
  return getApiMode() === 'mock'
}

