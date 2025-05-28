import { useResize } from '@/hooks/useResize'
import type { PointerEventLike } from '@/utils/bindClickOrDrag'
import { range } from '@/utils/range'
import { computed, inject, provide, ref, useTemplateRef, type InjectionKey, type Ref, type ShallowRef } from 'vue'

export interface PositionItem {
  top: number
  left: number
  width: number
  height: number
}

const DRAG_CONTAINER = Symbol('DRAG_CONTAINER') as InjectionKey<{
  createDragItem: (pos: Ref<PositionItem>) => {
    state: Ref<{ pos: PositionItem; active: boolean }>
    onActivation(e: PointerEventLike): void
    onStart(): void
    onMove(ev: { deltaX: number; deltaY: number }): void
    onEnd(): void
  }
  delta: Ref<{
    deltaX: number
    deltaY: number
  }>
  parentRect: Ref<DOMRectReadOnly | undefined>
}>
export function provideDragContainer(container: string | Readonly<ShallowRef<HTMLDivElement | null>>) {
  const c = typeof container === 'string' ? useTemplateRef<HTMLElement>(container) : container

  const items = ref<{ pos: PositionItem; active: boolean }[]>([])
  // 多选时的移动功能
  const delta = ref({ deltaX: 0, deltaY: 0 })

  function createDragItem(pos: Ref<PositionItem>) {
    const state = ref({ pos, active: false })
    items.value.push(state.value)

    const deltaRange = computed(() => {
      const { width, height } = c.value?.getBoundingClientRect() ?? { width: 0, height: 0 }
      const active = items.value.filter((i) => i.active).map((i) => i.pos)
      const left = Math.min(...active.map((i) => i.left))
      const top = Math.min(...active.map((i) => i.top))
      const right = Math.max(...active.map((i) => i.left + i.width))
      const bottom = Math.max(...active.map((i) => i.top + i.height))

      return {
        x: [-left, width - right],
        y: [-top, height - bottom],
      }
    })
    return {
      state,
      onActivation(e: PointerEventLike) {
        if (e.ctrlKey) {
          state.value.active = !state.value.active
        } else {
          items.value.forEach((i) => (i.active = false))
          state.value.active = true
        }
      },
      onStart() {
        if (!state.value.active) {
          items.value.forEach((i) => (i.active = false))
          state.value.active = true
        }
      },
      onMove(ev: { deltaX: number; deltaY: number }) {
        delta.value = {
          deltaX: range(ev.deltaX, deltaRange.value.x[0], deltaRange.value.x[1]),
          deltaY: range(ev.deltaY, deltaRange.value.y[0], deltaRange.value.y[1]),
        }
      },
      onEnd() {
        items.value
          .filter((i) => i.active)
          .forEach((i) => {
            i.pos.left += delta.value.deltaX
            i.pos.top += delta.value.deltaY
          })
        delta.value = { deltaX: 0, deltaY: 0 }
      },
    }
  }

  provide(DRAG_CONTAINER, {
    createDragItem,
    delta,
    parentRect: useResize(c),
  })

  return {
    items,
  }
}

export function useDrag(pos: Ref<PositionItem>) {
  const result = inject(DRAG_CONTAINER, null)
  if (!result) {
    throw new Error('inject DRAG_CONTAINER failed')
  }
  const { createDragItem, ...rest } = result
  return {
    ...createDragItem(pos),
    ...rest,
  }
}
