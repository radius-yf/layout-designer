<template>
  <div class="h-full flex flex-nowrap" @click="flag = !flag">
    <div class="bg-gray-100 flex-1"></div>
    <div
      class="bg-gray-200 overflow-hidden transition-[width] duration-1000"
      :class="flag ? 'w-auto' : 'w-0'"
      style="interpolate-size: allow-keywords"
    >
      <div class="w-32">Hello World</div>
      <div class="w-12">Hello World</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const flag = ref(true)
</script>
