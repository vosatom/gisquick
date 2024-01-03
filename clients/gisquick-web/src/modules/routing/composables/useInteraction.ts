import type Interaction from 'ol/interaction/Interaction'
import { onUnmounted, onMounted } from 'vue'

import { useOlMap } from '@/composables/useOlMap'

export function useInteraction<T extends Interaction>(instance: T): T {
  const map = useOlMap()

  onMounted(() => {
    map?.addInteraction(instance)
  })

  onUnmounted(() => {
    map?.removeInteraction(instance)
  })

  return instance
}
