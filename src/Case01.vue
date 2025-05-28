<template>
  <div class="relative" @dblclick="flag = !flag">
    <Container class="h-screen" :state="state" />
    <div
      class="absolute w-60 top-0 h-full bg-gray-100/50 transition-[left] p-8 grid grid-cols-2 items-start gap-1 z-100"
      :class="{ 'left-0': flag, '-left-60': !flag }"
    >
      <div
        v-for="item in list"
        :key="item.type"
        class="bg-gray-200 p-1 rounded text-center cursor-copy select-none"
        draggable="true"
        @dragstart="onDragStart($event, item)"
      >
        {{ item.name }}
      </div>
      <div class="bg-gray-200 p-1 rounded text-center cursor-pointer select-none" @click="state = []">clear</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core'
import { ref, type Component } from 'vue'
import { Container, provideComponent } from '@/components/container'

const state = useSessionStorage('state', [], { flush: 'post' })
const flag = ref(false)

const list = [
  {
    name: '容器',
    type: 'container',
    props: {},
  },
]

const comps: Record<string, Component> = {
  container: Container,
}
provideComponent((name) => {
  return comps[name]
})

function onDragStart(event: DragEvent, item: any) {
  event.dataTransfer?.setData('text/plain', JSON.stringify(item))
}
</script>
