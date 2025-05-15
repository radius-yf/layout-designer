<template>
  <div
    ref="drag"
    class="drag absolute select-none"
    :class="{ 'z-10': state.active }"
    :style="toStylePx(style)"
    v-drag="{
      ...moveOrResize('move'),
      onClick: onActivation,
    }"
  >
    <slot></slot>
    <div class="handle-border t" v-drag.stop="moveOrResize('move')"></div>
    <div class="handle-border l" v-drag.stop="moveOrResize('move')"></div>
    <div class="handle-border r" v-drag.stop="moveOrResize('move')"></div>
    <div class="handle-border b" v-drag.stop="moveOrResize('move')"></div>

    <div class="handle lt" v-drag.stop="moveOrResize('lt')"></div>
    <div class="handle rt" v-drag.stop="moveOrResize('rt')"></div>
    <div class="handle lb" v-drag.stop="moveOrResize('lb')"></div>
    <div class="handle rb" v-drag.stop="moveOrResize('rb')"></div>
    <div class="handle lc" v-drag.stop="moveOrResize('lc')"></div>
    <div class="handle rc" v-drag.stop="moveOrResize('rc')"></div>
    <div class="handle tc" v-drag.stop="moveOrResize('tc')"></div>
    <div class="handle bc" v-drag.stop="moveOrResize('bc')"></div>
  </div>
</template>
<script setup lang="ts">
import { vDrag, type DragHandlers } from '@/utils/bindClickOrDrag'
import { range } from '@/utils/range'
import { computed } from 'vue'
import { useDrag } from './hook'

const props = withDefaults(
  defineProps<{
    position: { top: number; left: number; width: number; height: number }
    minWidth?: number
    minHeight?: number
    step?: number
  }>(),
  {
    minWidth: 4,
    minHeight: 4,
    step: 1,
  }
)

const { state, delta, parentRect, onActivation, onStart, onEnd, onMove } = useDrag(props.position)

const style = computed(() => {
  const { top, left, width, height } = state.value
  return {
    top,
    left,
    width,
    height,
    transform: state.value.active ? `translate(${delta.value.deltaX}px, ${delta.value.deltaY}px)` : '',
  }
})

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
    onDragStart() {
      const init = {
        x: state.value.left,
        y: state.value.top,
        width: state.value.width,
        height: state.value.height,
      }
      moveFn = fn[type](init)
      onStart()
    },
    onDragging(delta) {
      if (type === 'move') {
        onMove({ deltaX: delta.dx, deltaY: delta.dy })
      } else {
        Object.assign(state.value, moveFn!(delta.dx, delta.dy))
      }
    },
    onDragEnd() {
      onEnd()
    },
  } satisfies DragHandlers
}

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

// util
function toStylePx(obj: Record<string, number | string | undefined | null>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in obj) {
    const value = obj[key]
    if (value != null) {
      result[key] = typeof value === 'number' ? `${value}px` : value
    }
  }
  return result
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
  left: calc(var(--size) / 2);
  width: calc(100% - var(--size));
  padding-top: calc(var(--size) / 2 - 1px);
  height: var(--size);
}
.handle-border.l {
  top: calc(var(--size) / 2);
  left: calc(var(--size) / -2);
  width: var(--size);
  padding-left: calc(var(--size) / 2 - 1px);
  height: calc(100% - var(--size));
}
.handle-border.r {
  top: calc(var(--size) / 2);
  right: calc(var(--size) / -2);
  width: var(--size);
  padding-left: calc(var(--size) / 2);
  height: calc(100% - var(--size));
}
.handle-border.b {
  bottom: calc(var(--size) / -2);
  left: calc(var(--size) / 2);
  width: calc(100% - var(--size));
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
