<template>
  <div
    ref="drag"
    class="drag absolute select-none"
    :class="{ 'z-10': state.active }"
    :style="toStylePx(style)"
    v-drag.stop="containerMove"
  >
    <slot></slot>

    <div class="absolute top-1 -right-1 translate-x-full" v-if="state.active">
      <slot name="handle"></slot>
    </div>
    <div v-if="!handles || handles.includes('t')" class="handle-border t" v-drag.stop="moveOrResize('move')"></div>
    <div v-if="!handles || handles.includes('l')" class="handle-border l" v-drag.stop="moveOrResize('move')"></div>
    <div v-if="!handles || handles.includes('r')" class="handle-border r" v-drag.stop="moveOrResize('move')"></div>
    <div v-if="!handles || handles.includes('b')" class="handle-border b" v-drag.stop="moveOrResize('move')"></div>

    <div v-if="!handles || handles.includes('lt')" class="handle lt" v-drag.stop="moveOrResize('lt')"></div>
    <div v-if="!handles || handles.includes('rt')" class="handle rt" v-drag.stop="moveOrResize('rt')"></div>
    <div v-if="!handles || handles.includes('lb')" class="handle lb" v-drag.stop="moveOrResize('lb')"></div>
    <div v-if="!handles || handles.includes('rb')" class="handle rb" v-drag.stop="moveOrResize('rb')"></div>
    <div v-if="!handles || handles.includes('lc')" class="handle lc" v-drag.stop="moveOrResize('lc')"></div>
    <div v-if="!handles || handles.includes('rc')" class="handle rc" v-drag.stop="moveOrResize('rc')"></div>
    <div v-if="!handles || handles.includes('tc')" class="handle tc" v-drag.stop="moveOrResize('tc')"></div>
    <div v-if="!handles || handles.includes('bc')" class="handle bc" v-drag.stop="moveOrResize('bc')"></div>
  </div>
</template>
<script setup lang="ts">
import { vDrag, type DragHandlers, type PointerEventLike } from '@/utils/bindClickOrDrag'
import { range } from '@/utils/range'
import { computed } from 'vue'
import { useDrag, type PositionItem } from './hook'
import { toStylePx } from './utils'

type HandleType = 'lt' | 'rt' | 'lb' | 'rb' | 'lc' | 'rc' | 'tc' | 'bc' | 't' | 'l' | 'r' | 'b'

const props = withDefaults(
  defineProps<{
    minWidth?: number
    minHeight?: number
    step?: number
    handles?: HandleType[]
  }>(),
  {
    minWidth: 4,
    minHeight: 4,
    step: 1,
  }
)
const emits = defineEmits<{
  (e: 'activation', ev: boolean): void
  (e: 'start', ev: { type: string; ev: PointerEventLike }): void
  (e: 'end', ev: { type: string; ev: PointerEventLike }): void
  (e: 'move', ev: { type: string; pos: PositionItem; ev: PointerEventLike }): void
}>()

const pos = defineModel<PositionItem>('pos', {
  required: true,
})

const { state, delta, parentRect, onActivation, onStart, onEnd, onMove } = useDrag(pos)

const style = computed(() => ({
  ...state.value.pos,
  transform: state.value.active ? `translate(${delta.value.deltaX}px, ${delta.value.deltaY}px)` : '',
}))

function moveOrResize(type: 'lt' | 'rt' | 'lb' | 'rb' | 'lc' | 'rc' | 'tc' | 'bc' | 'move') {
  let moveFn:
    | ((
        deltaX: number,
        deltaY: number
      ) => {
        left: number
        top: number
        width: number
        height: number
      })
    | null = null
  return {
    step: props.step,
    onDragStart(_, ev) {
      const init = {
        x: state.value.pos.left,
        y: state.value.pos.top,
        width: state.value.pos.width,
        height: state.value.pos.height,
      }
      moveFn = fn[type](init)
      onStart()
      emits('start', { type, ev })
    },
    onDragging(d, ev) {
      if (type === 'move') {
        onMove({ deltaX: d.dx, deltaY: d.dy })
      } else {
        Object.assign(state.value.pos, moveFn!(d.dx, d.dy))
      }
      emits('move', {
        type,
        pos:
          type === 'move'
            ? {
                top: state.value.pos.top + delta.value.deltaY,
                left: state.value.pos.left + delta.value.deltaX,
                width: state.value.pos.width,
                height: state.value.pos.height,
              }
            : state.value.pos,
        ev,
      })
    },
    onDragEnd(ev) {
      onEnd()
      emits('end', { type, ev })
    },
    onClick() {
      emits('activation', state.value.active)
    },
  } satisfies DragHandlers
}

const containerMove = {
  ...moveOrResize('move'),
  onClick: (ev) => {
    onActivation(ev)
    emits('activation', state.value.active)
  },
} satisfies DragHandlers

const fn = {
  move: () => null,
  lt: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: range(init.x + deltaX, 0, init.x + init.width - props.minWidth),
    top: range(init.y + deltaY, 0, init.y + init.height - props.minHeight),
    width: range(init.width - deltaX, props.minWidth, init.x + init.width),
    height: range(init.height - deltaY, props.minHeight, init.y + init.height),
  }),
  rt: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x,
    top: range(init.y + deltaY, 0, init.y + init.height - props.minHeight),
    width: range(init.width + deltaX, props.minWidth, parentRect.value!.width - init.x),
    height: range(init.height - deltaY, props.minHeight, init.y + init.height),
  }),
  lb: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: range(init.x + deltaX, 0, init.x + init.width - props.minWidth),
    top: init.y,
    width: range(init.width - deltaX, props.minWidth, init.x + init.width),
    height: range(init.height + deltaY, props.minHeight, parentRect.value!.height - init.y),
  }),
  rb: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: range(init.width + deltaX, props.minWidth, parentRect.value!.width - init.x),
    height: range(init.height + deltaY, props.minHeight, parentRect.value!.height - init.y),
  }),
  lc: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, _deltaY: number) => ({
    left: range(init.x + deltaX, 0, init.x + init.width - props.minWidth),
    top: init.y,
    width: range(init.width - deltaX, props.minWidth, init.x + init.width),
    height: init.height,
  }),
  rc: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, _deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: range(init.width + deltaX, props.minWidth, parentRect.value!.width - init.x),
    height: init.height,
  }),
  tc: (init: { x: number; y: number; width: number; height: number }) => (_deltaX: number, deltaY: number) => ({
    left: init.x,
    top: range(init.y + deltaY, 0, init.y + init.height - props.minHeight),
    width: init.width,
    height: range(init.height - deltaY, props.minHeight, init.y + init.height),
  }),
  bc: (init: { x: number; y: number; width: number; height: number }) => (_deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: init.width,
    height: range(init.height + deltaY, props.minHeight, parentRect.value!.height - init.y),
  }),
}
</script>

<style scoped>
.drag {
  --visible: v-bind('state.active ? "block" : "none"');
  --size: 8px;
}
.handle-border {
  display: var(--visible);
  position: absolute;
  cursor: move;
  box-sizing: border-box;
}
.handle-border:is(.t, .b)::before {
  content: '';
  display: block;
  width: 100%;
  border-top: 1px dashed black;
}
.handle-border:is(.l, .r)::before {
  content: '';
  display: block;
  height: 100%;
  border-left: 1px dashed black;
}
.handle-border.t {
  top: calc(var(--size) / -2);
  left: 0;
  width: 100%;
  padding-top: calc(var(--size) / 2 - 1px);
  height: var(--size);
}
.handle-border.l {
  top: 0;
  left: calc(var(--size) / -2);
  width: var(--size);
  padding-left: calc(var(--size) / 2 - 1px);
  height: 100%;
}
.handle-border.r {
  top: 0;
  right: calc(var(--size) / -2);
  width: var(--size);
  padding-left: calc(var(--size) / 2);
  height: 100%;
}
.handle-border.b {
  bottom: calc(var(--size) / -2);
  left: 0;
  width: 100%;
  padding-top: calc(var(--size) / 2);
  height: var(--size);
}

.handle {
  display: var(--visible);
  position: absolute;
  width: var(--size);
  height: var(--size);
  border: 1px solid black;
  background: white;
}
.handle.lt {
  left: calc(var(--size) / -2);
  top: calc(var(--size) / -2);
  cursor: nwse-resize;
}
.handle.rt {
  right: calc(var(--size) / -2);
  top: calc(var(--size) / -2);
  cursor: nesw-resize;
}
.handle.lb {
  left: calc(var(--size) / -2);
  bottom: calc(var(--size) / -2);
  cursor: nesw-resize;
}
.handle.rb {
  right: calc(var(--size) / -2);
  bottom: calc(var(--size) / -2);
  cursor: nwse-resize;
}
.handle.lc {
  left: calc(var(--size) / -2);
  top: 0;
  bottom: 0;
  margin: auto;
  cursor: ew-resize;
}
.handle.rc {
  right: calc(var(--size) / -2);
  top: 0;
  bottom: 0;
  margin: auto;
  cursor: ew-resize;
}
.handle.tc {
  top: calc(var(--size) / -2);
  left: 0;
  right: 0;
  margin: auto;
  cursor: ns-resize;
}
.handle.bc {
  bottom: calc(var(--size) / -2);
  left: 0;
  right: 0;
  margin: auto;
  cursor: ns-resize;
}
</style>
