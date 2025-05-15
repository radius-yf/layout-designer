<template>
  <DragContainer class="h-screen">
    <DragItem :position="{ top: 100, left: 100, width: 100, height: 100 }">
      <div class="w-full h-full bg-red-500"></div>
    </DragItem>
    <DragItem :position="{ top: 100, left: 200, width: 100, height: 100 }">
      <div class="w-full h-full bg-blue-500"></div>
    </DragItem>
  </DragContainer>
</template>
<script setup lang="ts">
import DragContainer from './components/DragContainer.vue'
import DragItem from './components/DragItem.vue'
</script>
