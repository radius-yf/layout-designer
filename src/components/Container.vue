<template>
  <DragContainer @drop.self.prevent="onDrop" @dragover.prevent :disableSelection="disabled">
    <Comp
      v-for="item in child"
      :key="item.id"
      :state="item.config"
      :option="item"
      :lastPoint="lastPoint"
      @remove="child.splice(child.indexOf(item), 1)"
    />
  </DragContainer>
</template>
<script setup lang="ts" hoc="@/hooks/state#withRestState">
import { useState } from '@/hooks/state'
import { inject, provide, ref } from 'vue'
import Comp from './Comp.vue'
import DragContainer from './drag/DragContainer.vue'
import type { Child } from './type'

const isRoot = inject('isRoot', true)
provide('isRoot', false)
const disabled = useState(!isRoot)

const child = useState<Child[]>([])

const lastPoint = ref({ x: 0, y: 0 })
function onDrop(event: DragEvent) {
  const opt = event.dataTransfer?.getData('text/plain')
  if (!opt) return

  const option = JSON.parse(opt)
  lastPoint.value = { x: event.offsetX, y: event.offsetY }
  addChild(option)
}

function addChild(option: any) {
  child.value.push({
    id: String(Math.random()),
    name: option.type,
    config: [],
    option: [],
  })
}
</script>
