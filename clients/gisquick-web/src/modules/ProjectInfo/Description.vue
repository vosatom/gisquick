<template>
  <div ref="description" class="px-2 py-2" v-if="content" v-html="content" />
</template>

<script setup lang="jsx">
import { watch, ref } from 'vue'

import { useStore } from '@/store/typed'

const description = ref(null)

defineProps({
  content: String,
})

const store = useStore()

watch(description, () => {
  if (!description.value) return

  description.value.querySelectorAll('a').forEach((link) => {
    let handle = null

    if (link.hash === '#legenda') {
      handle = () => {
        store.commit('activeTab', 'layers')
        store.commit('layersTab', 'legend')
      }
    }

    if (handle) {
      link.addEventListener('click', (event) => {
        if (handle) {
          handle(event)
          event.preventDefault()
        }
      })
    }
  })
})
</script>
