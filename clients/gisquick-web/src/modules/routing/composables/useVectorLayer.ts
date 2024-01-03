import type { Geometry } from 'ol/geom'
import type { Options } from 'ol/layer/BaseVector'
import VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'
import { onUnmounted, onMounted } from 'vue'

import { useOlMap } from '@/composables/useOlMap'

export function useVectorLayer<VectorSourceType extends VectorSource<Geometry>>(
  args: Options<VectorSourceType>,
) {
  const map = useOlMap()
  const vectorLayer = new VectorLayer(args)

  onMounted(() => {
    map?.addLayer(vectorLayer)
  })

  onUnmounted(() => {
    map?.removeLayer(vectorLayer)
  })

  return vectorLayer
}
