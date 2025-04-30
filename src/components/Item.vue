<template>
  <div ref="drag" class="drag absolute" :style="toStylePx(position)" @mousedown.prevent="">
    <div class="w-full h-full bg-red-500"></div>
    <div class="handle-border t" @mousedown.prevent.stop="moveOrResize($event, 'move')"></div>
    <div class="handle-border l" @mousedown.prevent.stop="moveOrResize($event, 'move')"></div>
    <div class="handle-border r" @mousedown.prevent.stop="moveOrResize($event, 'move')"></div>
    <div class="handle-border b" @mousedown.prevent.stop="moveOrResize($event, 'move')"></div>

    <div class="handle lt" @mousedown.stop="moveOrResize($event, 'lt')"></div>
    <div class="handle rt" @mousedown.stop="moveOrResize($event, 'rt')"></div>
    <div class="handle lb" @mousedown.stop="moveOrResize($event, 'lb')"></div>
    <div class="handle rb" @mousedown.stop="moveOrResize($event, 'rb')"></div>
    <div class="handle lc" @mousedown.stop="moveOrResize($event, 'lc')"></div>
    <div class="handle rc" @mousedown.stop="moveOrResize($event, 'rc')"></div>
    <div class="handle tc" @mousedown.stop="moveOrResize($event, 'tc')"></div>
    <div class="handle bc" @mousedown.stop="moveOrResize($event, 'bc')"></div>
  </div>
</template>
<script setup lang="ts">
import { range } from '@/utils/range'
import { onMounted, ref, useTemplateRef } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    position: { top: number; left: number; width: number; height: number }
    minWidth?: number
    minHeight?: number
  }>(),
  {
    active: true,
    minWidth: 0,
    minHeight: 0,
  }
)
const emit = defineEmits<{
  // change: [pos: { top: number; left: number; width: number; height: number }]
  start: [pos: { x: number; y: number; width: number; height: number }]
  move: [pos: { deltaX: number; deltaY: number }]
  end: [pos: { x: number; y: number; width: number; height: number }]
}>()

const position = ref(props.position)

const self = useTemplateRef('drag')
const currentRect = ref({ width: 0, height: 0 })
onMounted(() => {
  const { width, height } = self.value!.parentElement!.getBoundingClientRect()
  currentRect.value = { width, height }
})
function moveOrResize(ev: MouseEvent, type: 'lt' | 'rt' | 'lb' | 'rb' | 'lc' | 'rc' | 'tc' | 'bc' | 'move') {
  const init = {
    x: position.value.left,
    y: position.value.top,
    width: position.value.width,
    height: position.value.height,
  }
  emit('start', init)
  const moveFn = fn[type](init)

  mouseMoveDelta(
    ev,
    type === 'move'
      ? (deltaX, deltaY) => {
          emit('move', { deltaX, deltaY })
        }
      : (deltaX, deltaY) => {
          const { top, left, width, height } = moveFn(deltaX, deltaY)
          position.value.top = range(top, 0, currentRect.value.height - position.value.height)
          position.value.left = range(left, 0, currentRect.value.width - position.value.width)
          position.value.width = range(width, props.minWidth, currentRect.value.width - position.value.left)
          position.value.height = range(height, props.minHeight, currentRect.value.height - position.value.top)
        },
    () => {
      emit('end', {
        x: position.value.left,
        y: position.value.top,
        width: position.value.width,
        height: position.value.height,
      })
    },
    1
  )
}

const fn = {
  move: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => {
    emit('move', { deltaX, deltaY })
    return {
      left: init.x + deltaX,
      top: init.y + deltaY,
      width: init.width,
      height: init.height,
    }
  },
  lt: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x + deltaX,
    top: init.y + deltaY,
    width: init.width - deltaX,
    height: init.height - deltaY,
  }),
  rt: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y + deltaY,
    width: init.width + deltaX,
    height: init.height - deltaY,
  }),
  lb: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x + deltaX,
    top: init.y,
    width: init.width - deltaX,
    height: init.height + deltaY,
  }),
  rb: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: init.width + deltaX,
    height: init.height + deltaY,
  }),
  lc: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, _deltaY: number) => ({
    left: init.x + deltaX,
    top: init.y,
    width: init.width - deltaX,
    height: init.height,
  }),
  rc: (init: { x: number; y: number; width: number; height: number }) => (deltaX: number, _deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: init.width + deltaX,
    height: init.height,
  }),
  tc: (init: { x: number; y: number; width: number; height: number }) => (_deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y + deltaY,
    width: init.width,
    height: init.height - deltaY,
  }),
  bc: (init: { x: number; y: number; width: number; height: number }) => (_deltaX: number, deltaY: number) => ({
    left: init.x,
    top: init.y,
    width: init.width,
    height: init.height + deltaY,
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
function mouseMoveDelta(
  ev: MouseEvent,
  move: (deltaX: number, deltaY: number) => void,
  up: () => void,
  step: number = 1
) {
  const state = {
    startX: ev.clientX,
    startY: ev.clientY,
  }

  document.addEventListener('mouseup', onUp)
  document.addEventListener('mousemove', onMove)
  function onMove(ev: MouseEvent) {
    const deltaX = Math.round((ev.clientX - state.startX) / step) * step
    const deltaY = Math.round((ev.clientY - state.startY) / step) * step
    move(deltaX, deltaY)
  }
  function onUp() {
    up()
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
}
</script>

<style scoped>
.drag {
  border: 1px dashed;
  border-color: v-bind('props.active ? "black" : "transparent"');
  --size: 8px;
}
.handle-border {
  display: v-bind('props.active ? "block" : "none"');
  position: absolute;
  cursor: move;
}
.handle-border.t {
  top: calc(var(--size) / -2);
  left: calc(var(--size) / 2);
  width: calc(100% - var(--size));
  height: var(--size);
}
.handle-border.l {
  top: calc(var(--size) / 2);
  left: calc(var(--size) / -2);
  width: var(--size);
  height: calc(100% - var(--size));
}
.handle-border.r {
  top: calc(var(--size) / 2);
  right: calc(var(--size) / -2);
  width: var(--size);
  height: calc(100% - var(--size));
}
.handle-border.b {
  bottom: calc(var(--size) / -2);
  left: calc(var(--size) / 2);
  width: calc(100% - var(--size));
  height: var(--size);
}

.handle {
  display: v-bind('props.active ? "block" : "none"');
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
