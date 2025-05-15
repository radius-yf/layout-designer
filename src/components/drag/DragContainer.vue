<template>
  <div class="relative overflow-hidden" ref="container" v-drag.self="selection">
    <slot></slot>
    <div class="absolute border-dashed border-1 border-blue-500 bg-blue-500/20 z-50" :style="style"></div>
  </div>
</template>
<script lang="ts"></script>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { provideDragContainer } from './hook'
import { vDrag, type DragHandlers } from '@/utils/bindClickOrDrag'

const { items } = provideDragContainer('container')

const start = ref<{ x: number; y: number }>()
const end = ref<{ x: number; y: number }>()
const style = computed(() =>
  start.value && end.value
    ? {
        left: Math.min(start.value.x, end.value.x) + 'px',
        top: Math.min(start.value.y, end.value.y) + 'px',
        width: Math.abs(end.value.x - start.value.x) + 'px',
        height: Math.abs(end.value.y - start.value.y) + 'px',
      }
    : { display: 'none' }
)
const selection: DragHandlers = {
  onDragStart(st) {
    start.value = st
  },
  onDragging(delta) {
    if (!start.value) return
    end.value = { x: start.value.x + delta.dx, y: start.value.y + delta.dy }
    onSelected({
      x: start.value.x > end.value.x ? [end.value.x, start.value.x] : [start.value.x, end.value.x],
      y: start.value.y > end.value.y ? [end.value.y, start.value.y] : [start.value.y, end.value.y],
    })
  },
  onDragEnd() {
    start.value = undefined
    end.value = undefined
  },
  onClick() {
    items.value.forEach((i) => (i.active = false))
  },
}

function onSelected(rect: { x: [number, number]; y: [number, number] }) {
  items.value.forEach((item) => {
    item.active = inRect(rect, item.left + item.width / 2, item.top + item.height / 2)
  })
}

function inRect(rect: { x: [number, number]; y: [number, number] }, x: number, y: number): boolean {
  return x >= rect.x[0] && x <= rect.x[1] && y >= rect.y[0] && y <= rect.y[1]
}
</script>
