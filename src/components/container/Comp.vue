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
import DragItem from '../drag/DragItem.vue'
import { useComponent, useEndPoint } from './hooks/context'
import type { Child } from '../type'
import { computed } from 'vue'

const emit = defineEmits(['remove'])
const props = defineProps<{ option: Child }>()
const getComp = useComponent()
const Comp = computed(() => getComp.value?.(props.option.name))

const endPoint = useEndPoint()

const pos = useState(init())
function init() {
  const minWidth = 100
  const minHeight = 100
  return {
    top: endPoint.value.y - minHeight / 2,
    left: endPoint.value.x - minWidth / 2,
    width: minWidth,
    height: minHeight,
  }
}
</script>
