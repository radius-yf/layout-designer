<template>
  <Test :initial-state="store" @change="onChange" msg="123" />
</template>

<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core'
import { withRestState } from './hooks/state'
import _Test from './components/Test.vue'
const Test = withRestState(_Test)

const store = useSessionStorage('testState', [3, { value: 4 }])

function onChange() {
  // 无需为store.value赋值
  console.log(JSON.stringify(store.value))
}

setTimeout(() => {
  // 为store.value赋值时，会重新加载组件
  store.value = [123, { value: 456 }]
}, 2000)
</script>
