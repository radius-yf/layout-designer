<template>
  <div>
    <div @click="count++">count: {{ count }}</div>
    <button @click="count2.value++">count2: {{ count2 }}</button>
  </div>
</template>

<script setup lang="ts" hoc="../hooks/state#withRestState">
import { useState } from '../hooks/state'

const props = defineProps<{ msg: string }>()

console.log(props.msg)

const count = useState(0)
const count2 = useState({ value: 0 })

// if (condition) {
//   const state = useState(0) // 错误，不能在if/for/while等语句中使用 useState
// }
</script>
