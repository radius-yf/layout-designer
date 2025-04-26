<template>
  <div
    class="h-full grid transition-[grid-template-columns]"
    :class="[flag ? 'grid-cols-[0px_1fr_0px]' : 'grid-cols-[240px_1fr_240px]']"
    @click="flag = !flag"
  >
    <div class="bg-gray-200"></div>
    <div class="bg-gray-100"></div>
    <div class="bg-gray-200"></div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const flag = ref(false)
</script>
