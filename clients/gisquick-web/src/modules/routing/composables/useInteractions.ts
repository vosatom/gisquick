import type { Feature } from 'ol'
import Draw from 'ol/interaction/Draw'
import type Interaction from 'ol/interaction/Interaction'
import Modify from 'ol/interaction/Modify'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'
import { onUnmounted, onMounted, type Ref } from 'vue'

import { hitTolerance } from '../constants'
import { FeatureDrag } from '../FeatureDrag'
import { pathCursorStyle } from '../mapStyles'
import type { SyncedVectorSource } from '../SyncedVectorSource'

import { useOlMap } from '@/composables/useOlMap'

export function useInteractions({
  pointsSource,
  pointsLayer,
  pathSource,
  pathLayer,
  selectedPathIndex,

  hoveringFeatures,
}: {
  pointsSource: SyncedVectorSource
  pointsLayer: VectorLayer<VectorSource>
  pathSource: VectorSource
  pathLayer: VectorLayer<VectorSource>
  selectedPathIndex: Ref<number | undefined>

  hoveringFeatures: Ref<Feature | undefined>
}) {
  const map = useOlMap()

  const interactions: Record<string, Interaction | null> = {
    draw: null,
    modify: null,
    snap: null,
  }

  onMounted(() => {
    interactions.modify = new Modify({
      source: pointsSource,
      hitDetection: pointsLayer,
      style: [],
    })

    interactions.modifyDrag = new FeatureDrag({
      source: pointsSource,
      inputSource: pathSource,
      pathLayer: pathLayer,
      style: pathCursorStyle,
      hitTolerance,
    })

    interactions.draw = new Draw({
      source: pointsSource,
      type: 'Point',
      style: [],
    })

    // map.addInteraction(interactions.draw)
    map.addInteraction(interactions.modify)
    map.addInteraction(interactions.modifyDrag)

    const overlaySource = interactions.modify.getOverlay().getSource()
    overlaySource.on(['addfeature', 'removefeature'], (event) => {
      hoveringFeatures.value =
        event.type === 'addfeature' ? event.feature : undefined
    })

    interactions.modify?.on(['modifystart', 'modifyend'], (event) => {
      pointsSource.modifyingFeatures = event.type === 'modifystart'
    })

    interactions.modifyDrag.on('hover', (event) => {
      hoveringFeatures.value = event.feature
    })

    interactions.modifyDrag?.on('selectpath', (event) => {
      const feature = event.feature
      selectedPathIndex.value = feature.get('pathIndex')
    })

    interactions.modifyDrag?.on(['modifystart', 'modifyend'], (event) => {
      pointsSource.modifyingFeatures = event.type === 'modifystart'
    })
  })

  onUnmounted(() => {
    Object.keys(interactions).forEach((key) => {
      if (interactions[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.removeInteraction(interactions[key] as unknown as any)
        interactions[key] = null
      }
    })
  })
}
