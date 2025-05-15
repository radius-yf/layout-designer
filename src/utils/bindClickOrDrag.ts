import type { DirectiveBinding } from 'vue'
export type PointerEventLike = MouseEvent | TouchEvent
interface DragDelta {
  dx: number
  dy: number
}
export interface DragHandlers {
  onClick?: (e: PointerEventLike) => void
  onDragStart?: (start: { x: number; y: number }, e: PointerEventLike) => void
  onDragging?: (delta: DragDelta, e: PointerEventLike) => void
  onDragEnd?: (e: PointerEventLike) => void
  threshold?: number
  step?: number
}

export const vDrag = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DragHandlers>) {
    const { onClick, onDragStart, onDragging, onDragEnd, step = 1 } = binding.value || {}
    const threshold = binding.value.threshold ?? Math.max(5, step)

    const start = (startX: number, startY: number, originEvent: PointerEventLike, mode: 'mouse' | 'touch') => {
      let isDragging = false

      const moveListener = (e: PointerEventLike) => {
        const point = getPoint(e)
        if (!point) return

        const dx = Math.round((point.clientX - startX) / step) * step
        const dy = Math.round((point.clientY - startY) / step) * step

        if (isDragging) {
          onDragging?.({ dx, dy }, e)
        } else if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
          isDragging = true
          onDragStart?.({ x: startX, y: startY }, originEvent)
        }
      }

      const endListener = (e: PointerEventLike) => {
        cleanup()
        if (isDragging) {
          onDragEnd?.(e)
        } else {
          onClick?.(e)
        }
      }

      function cleanup() {
        if (mode === 'mouse') {
          document.removeEventListener('mousemove', moveListener as EventListener)
          document.removeEventListener('mouseup', endListener as EventListener)
        } else {
          document.removeEventListener('touchmove', moveListener as EventListener)
          document.removeEventListener('touchend', endListener as EventListener)
          document.removeEventListener('touchcancel', endListener as EventListener)
        }
      }

      if (mode === 'mouse') {
        document.addEventListener('mousemove', moveListener as EventListener)
        document.addEventListener('mouseup', endListener as EventListener)
      } else {
        document.addEventListener('touchmove', moveListener as EventListener, { passive: false })
        document.addEventListener('touchend', endListener as EventListener)
        document.addEventListener('touchcancel', endListener as EventListener)
      }
    }

    function getPoint(e: PointerEventLike): { clientX: number; clientY: number } | null {
      if (e instanceof MouseEvent) {
        return { clientX: e.clientX, clientY: e.clientY }
      } else if (e.touches?.[0]) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
      }
      return null
    }

    const onMouseDown = (e: MouseEvent) => {
      if (!applyModifiers(e, binding.modifiers)) return
      start(e.clientX, e.clientY, e, 'mouse')
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (!applyModifiers(e, binding.modifiers)) return
      const t = e.touches[0]
      start(t.clientX, t.clientY, e, 'touch')
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('touchstart', onTouchStart, { passive: false })

    // 挂到元素上供 unmounted 时移除监听
    ;(el as any).__dragListeners__ = { onMouseDown, onTouchStart }
  },

  unmounted(el: HTMLElement) {
    const listeners = (el as any).__dragListeners__
    if (listeners) {
      el.removeEventListener('mousedown', listeners.onMouseDown)
      el.removeEventListener('touchstart', listeners.onTouchStart)
    }
    delete (el as any).__dragListeners__
  },
}

export function applyModifiers(e: Event, modifiers: Record<string, boolean>): boolean {
  if (modifiers.self && e.target !== e.currentTarget) return false
  if (modifiers.stop) e.stopPropagation()
  if (modifiers.prevent) e.preventDefault()
  return true
}
