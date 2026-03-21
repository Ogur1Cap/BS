export type ServiceKey = 'fullEscort' | 'rankBoost' | 'equipment' | 'specialMission' | 'unlock'

export interface ServiceMeta {
  key: ServiceKey
  name: string
  defaultAmount: number
}

export const SERVICE_LIST: ServiceMeta[] = [
  { key: 'fullEscort', name: '全程护航', defaultAmount: 198 },
  { key: 'rankBoost', name: '段位提升', defaultAmount: 298 },
  { key: 'equipment', name: '装备代刷', defaultAmount: 158 },
  { key: 'specialMission', name: '任务代练', defaultAmount: 188 },
  { key: 'unlock', name: '武器解锁', defaultAmount: 128 }
]

export function getServiceByKey(key: string) {
  return SERVICE_LIST.find((item) => item.key === key)
}

export function getServiceByName(name: string) {
  return SERVICE_LIST.find((item) => item.name === name)
}
