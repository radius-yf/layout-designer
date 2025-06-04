<template>
  <div ref="grid" class="grid" :style="{ gridTemplateColumns: cols.join(' '), gridTemplateRows: rows.join(' ') }">
    <div style="grid-area: 1 / 1 / 2 / 2; min-height: 24px"></div>
    <DragContainer class="grid-full">
      <DragItem
        v-for="(item, index) in gridRows.slice(1)"
        :key="index"
        :handles="[]"
        :pos="{
          top: item - 2,
          left: 0,
          width: Infinity,
          height: 4,
        }"
        @end="rows[index] = $event.pos.top + 2 + 'px'"
      >
        <div class="bg-gray-200 h-full cursor-n-resize"></div>
      </DragItem>
    </DragContainer>
  </div>
</template>
<script setup lang="ts">
import { ref, useTemplateRef, watchEffect } from 'vue'
import DragContainer from '../drag/DragContainer.vue'
import { useGrid } from './hooks/useGrid'
import DragItem from '../drag/DragItem.vue'

const cols = ref(['repeat(24, 1fr)'])
const rows = ref(['auto', 'minmax(0px, 1fr)'])

interface Item {
  minWidth: number
  minHeight: number
  row: number
  rowSpan: number
  col: number
  colSpan: number
}
const items = ref<Item[]>([])

const { rows: gridRows, columns } = useGrid(useTemplateRef('grid'), [cols, rows])

watchEffect(() => {
  console.log(gridRows.value, columns.value)
})
</script>
