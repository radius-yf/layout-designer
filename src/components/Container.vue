<template>
  <div class="relative overflow-hidden" ref="container" @click.self=";(active = []), console.log(...items)">
    <Item
      v-for="(i, index) in items"
      :key="index"
      :position="i"
      :min-width="100"
      :min-height="100"
      :active="active.includes(index)"
      @mousedown="handleClick($event, index)"
      @start="moveIndex = index"
      @move="
        delta = {
          deltaX: range($event.deltaX, deltaRange.x[0], deltaRange.x[1]),
          deltaY: range($event.deltaY, deltaRange.y[0], deltaRange.y[1]),
        }
      "
      @end="onEnd"
      :style="active.includes(index) ? { transform: `translate(${delta.deltaX}px, ${delta.deltaY}px)` } : {}"
    ></Item>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import Item from './Item.vue'
import { range } from '@/utils/range'
const active = ref<number[]>([])

const container = useTemplateRef('container')

const deltaRange = computed(() => {
  const { width, height } = container.value?.getBoundingClientRect() ?? { width: 0, height: 0 }
  const left = Math.min(...active.value.map((i) => items.value[i].left))
  const top = Math.min(...active.value.map((i) => items.value[i].top))
  const right = Math.max(...active.value.map((i) => items.value[i].left + items.value[i].width))
  const bottom = Math.max(...active.value.map((i) => items.value[i].top + items.value[i].height))
  console.log(width, height, left, top, right, bottom)

  return {
    x: [-left, width - right],
    y: [-top, height - bottom],
  }
})

function handleClick(e: MouseEvent, i: number) {
  active.value = e.ctrlKey
    ? active.value.includes(i)
      ? active.value.filter((n) => n !== i)
      : [...active.value, i]
    : [i]
}
const items = ref([
  { top: 0, left: 0, width: 100, height: 100 },
  { top: 0, left: 100, width: 100, height: 100 },
  { top: 0, left: 200, width: 100, height: 100 },
])

const moveIndex = ref(-1)
const delta = ref({ deltaX: 0, deltaY: 0 })
function onEnd() {
  active.value.forEach((i) => {
    items.value[i].left += delta.value.deltaX
    items.value[i].top += delta.value.deltaY
  })
  moveIndex.value = -1
  delta.value = { deltaX: 0, deltaY: 0 }
}
</script>
