<template>
  <scroll-area>
    <div v-if="props.isVisible">
      <Routing
        :route-provider="provider"
        :isolines-provider="isolinesProvider"
        :enabled="true"
      />
    </div>
  </scroll-area>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

import Routing from './Routing.vue'
import { useProvider } from '../composables/useGetService'
import { getQueryFromState, loadStateFromQuery } from '../store'

import { useOlMap } from '@/composables/useOlMap'
import { useStore } from '@/store/typed'
import type { GlobalQuery } from '@/store/typed'

const store = useStore()
const props = withDefaults(defineProps<{ isVisible?: boolean }>(), {
  isVisible: false,
})
const provider = useProvider('route')
const isolinesProvider = useProvider('isoline')

const map = useOlMap()

function updateActiveTool(isVisible) {
  if (map) {
    const show = !isVisible
    map.clientLayer.setVisible(show)
    map.overlay.setVisible(show)
  }

  if (isVisible) {
    store.commit('activeTool', 'routing')
  } else {
    if (store.state.activeTool === 'routing') {
      store.commit('activeTool', null)
    }
  }
}

onMounted(() => {
  updateActiveTool(true)
})

onUnmounted(() => {
  updateActiveTool(false)
})

defineExpose({
  loadPermalink(queryParams: GlobalQuery) {
    return loadStateFromQuery(store, queryParams)
  },
  getPermalinkParams() {
    return getQueryFromState(store)
  },
})
</script>
