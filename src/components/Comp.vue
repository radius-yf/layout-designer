<template>
  <DragItem v-model:pos="pos" :min-width="100" :min-height="100">
    <component :is="Comp" class="w-full h-full" />
    <template #handle>
      <button @click.stop="emit('remove')">删除</button>
    </template>
  </DragItem>
</template>
<script setup lang="ts" hoc="@/hooks/state#withRestState">
import { useState } from '@/hooks/state'
import DragItem from './drag/DragItem.vue'
import type { Child } from './type'
import { inject, type Component } from 'vue'

const emit = defineEmits(['remove'])
const props = defineProps<{ option: Child; lastPoint: { x: number; y: number } }>()
const getComponent = inject('getComponent') as (name: string) => Component
const Comp = getComponent(props.option.name)

const pos = useState(init())
function init() {
  const minWidth = 100
  const minHeight = 100
  return {
    top: props.lastPoint.y - minHeight / 2,
    left: props.lastPoint.x - minWidth / 2,
    width: minWidth,
    height: minHeight,
  }
}
</script>
