<template><div></div></template>
<script setup lang="ts">
import { useOlMap } from '@/composables/useOlMap'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { MapBrowserEvent } from 'ol'
import { useStore } from '@/store/typed'

const map = useOlMap()

const emit = defineEmits(['click'])

const hover = ref(false)

const store = useStore()

function handleMousemove(event: MapBrowserEvent<PointerEvent>) {
  if (event.dragging) {
    return
  }
  const data = map.overlay.getData(event.pixel)
  const hit = data && data[3] > 0
  hover.value = !!hit
}

function handleClick(event: MapBrowserEvent<PointerEvent>) {
  emit('click', event)
}

function updateCursor(hover: boolean, isMounted: boolean) {
  let newCursor = undefined
  if (isMounted) {
    if (hover) {
      newCursor = 'pointer'
    } else {
      newCursor = 'crosshair'
    }
  }

  store.commit('identificationCursor', newCursor)
}

watch(hover, (hover) => {
  updateCursor(hover, true)
})

onMounted(() => {
  // Wait for map to be inserted into DOM
  updateCursor(hover.value, true)
  map.addEventListener('pointermove', handleMousemove)
  map.addEventListener('singleclick', handleClick)
})
onBeforeUnmount(() => {
  updateCursor(hover.value, false)
  map.removeEventListener('pointermove', handleMousemove)
  map.removeEventListener('singleclick', handleClick)
})
</script>
