<template><div></div></template>
<script setup lang="ts">
import { useOlMap } from '@/composables/useOlMap'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from '@/store/typed'

const map = useOlMap()

function updateCursor(newCursor: string) {
  map.getTargetElement().style.cursor = newCursor
}

const store = useStore()

function calculateCursor() {
  return store.state.routing.cursor ?? store.state.identificationCursor ?? ''
}

watch(
  [() => store.state.routing.cursor, () => store.state.identificationCursor],
  () => {
    updateCursor(calculateCursor())
  },
)

onMounted(() => {
  // Wait for map to be inserted into DOM
  setTimeout(() => {
    updateCursor(calculateCursor())
  })
})
onBeforeUnmount(() => {
  updateCursor('')
})
</script>
