import { useResizeObserver, type MaybeComputedElementRef } from '@vueuse/core'
import { ref } from 'vue'

export function useResize(container: MaybeComputedElementRef) {
  const currentRect = ref<DOMRectReadOnly>()
  useResizeObserver(container, (entries) => {
    currentRect.value = entries[0].contentRect
  })
  return currentRect
}
