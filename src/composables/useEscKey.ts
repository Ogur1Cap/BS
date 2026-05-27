import { onMounted, onUnmounted, type Ref } from 'vue'

export function useEscKey(visible: Ref<boolean>, onClose: () => void) {
  function handler(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible.value) {
      onClose()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
  })
}
