<template>
  <DragContainer @drop.self.prevent="onDrop" @dragover.prevent :disableSelection="disabled">
    <Comp
      v-for="item in child"
      :key="item.id"
      :state="item.config"
      :option="item"
      @remove="child.splice(child.indexOf(item), 1)"
    />
  </DragContainer>
</template>
<script setup lang="ts" hoc="@/hooks/state#withRestState">
import { useState } from '@/hooks/state'
import { inject, provide, type InjectionKey } from 'vue'
import Comp from './Comp.vue'
import DragContainer from '../drag/DragContainer.vue'
import { provideEndPoint } from './hooks/context'
import type { Child } from '../type'

const IS_ROOT = Symbol() as InjectionKey<boolean>
const isRoot = inject(IS_ROOT, true)
provide(IS_ROOT, false)

const disabled = useState(!isRoot)

const child = useState<Child[]>([])

const endPoint = provideEndPoint()
function onDrop(event: DragEvent) {
  const opt = event.dataTransfer?.getData('text/plain')
  if (!opt) return

  const option = JSON.parse(opt)
  endPoint.value = { x: event.offsetX, y: event.offsetY }
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
