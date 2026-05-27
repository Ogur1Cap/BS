import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(source: Ref<T>, delay = 300) {
  const debounced = ref(source.value) as Ref<T>

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  return { debounced }
}

export function debouncedRef<T>(initial: T, delay = 300) {
  const raw = ref(initial)
  const debounced = ref(initial) as Ref<T>

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(raw, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  return { raw, debounced }
}
