import { ref, computed } from 'vue'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 登录/注册页：根据鼠标在视口中的位置输出 -1~1 的归一化坐标，
 * 用于背景视差、柔光跟随、卡片微倾斜（尊重 prefers-reduced-motion）。
 */
export function useAuthPointerMotion() {
  const motionEnabled = ref(!prefersReducedMotion())
  const nx = ref(0)
  const ny = ref(0)

  function onPointerMove(e: MouseEvent) {
    if (!motionEnabled.value) return
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    // 视口归一化：中心为 (0,0)，便于 calc 里直接乘位移/角度
    nx.value = (e.clientX / w) * 2 - 1
    ny.value = (e.clientY / h) * 2 - 1
  }

  function onPointerLeave() {
    nx.value = 0
    ny.value = 0
  }

  /** 挂在页面根节点上，供子层 backdrop / 卡片使用 */
  const pointerStyle = computed(() => {
    if (!motionEnabled.value) return {}
    return {
      '--ptr-x': String(nx.value),
      '--ptr-y': String(ny.value)
    } as Record<string, string>
  })

  return {
    motionEnabled,
    onPointerMove,
    onPointerLeave,
    pointerStyle
  }
}
