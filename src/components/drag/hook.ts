import { useResize } from '@/hooks/useResize'
import type { PointerEventLike } from '@/utils/bindClickOrDrag'
import { range } from '@/utils/range'
import {
  computed,
  inject,
  provide,
  ref,
  useTemplateRef,
  watch,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from 'vue'

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
  const actives = computed(() => items.value.filter((i) => i.active))

  // 多选时的移动功能
  const delta = ref({ deltaX: 0, deltaY: 0 })

  function createDragItem(pos: Ref<PositionItem>) {
    const state = ref({ pos, active: false })
    items.value.push(state.value)

    const deltaRange = computed(() => {
      const { width, height } = c.value?.getBoundingClientRect() ?? { width: 0, height: 0 }
      const left = Math.min(...actives.value.map((i) => i.pos.left))
      const top = Math.min(...actives.value.map((i) => i.pos.top))
      const right = Math.max(...actives.value.map((i) => i.pos.left + i.pos.width))
      const bottom = Math.max(...actives.value.map((i) => i.pos.top + i.pos.height))
      console.log(left, top, right, bottom)

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
        items.value.forEach((i) => (i.active = false))
        state.value.active = true
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
  watch(
    result.parentRect,
    () => {
      if (result.parentRect.value) {
        pos.value.width = Math.min(pos.value.width, result.parentRect.value.width)
        pos.value.height = Math.min(pos.value.height, result.parentRect.value.height)
      }
    },
    { immediate: true }
  )
  return {
    ...createDragItem(pos),
    ...rest,
  }
}
