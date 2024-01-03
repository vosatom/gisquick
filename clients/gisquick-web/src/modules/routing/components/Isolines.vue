<template>
  <div class="section px-4">
    <div class="section px-2 error f-col-ac my-4" v-if="service.error.value">
      <span>{{ getFormattedErrorMessage(service.error.value) }}</span>
    </div>

    <div>{{ toStringHDMS(toLonLat(point)) }}</div>
  </div>
</template>
<script setup lang="ts">
import { toStringHDMS, type Coordinate } from 'ol/coordinate.js'
import { containsExtent } from 'ol/extent'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Modify from 'ol/interaction/Modify'
import { fromLonLat, toLonLat } from 'ol/proj'
import { ref, watch, onMounted, watchEffect, computed } from 'vue'

import { useInteraction } from '../composables/useInteraction'
import { useIsolines } from '../composables/useIsolines'
import { useVectorLayer } from '../composables/useVectorLayer'
import { pointStyle } from '../mapStyles'
import { MutationKey } from '../store'
import { SyncedVectorSource } from '../SyncedVectorSource'
import { getFormattedErrorMessage } from '../util/getFormattedErrorMessage'

import { useOlMap } from '@/composables/useOlMap'
import type { BaseService } from '@/modules/services/base/service'
import { useStore } from '@/store/typed'

const map = useOlMap()

const userProjection = map.getView().getProjection()

const props = defineProps<{
  isEnabled?: boolean
  provider: BaseService
}>()

const store = useStore()

const point = ref<Coordinate>(
  fromLonLat([14.383347807482387, 50.10892209142125], userProjection),
)

const pointsSource = new SyncedVectorSource({
  handleChangeFeature: (feature?: Feature<Point>) => {
    if (!feature) return
    point.value = feature.getGeometry()?.getCoordinates()
  },
})
const pointsLayer = useVectorLayer({
  source: pointsSource,
  style: pointStyle,
})

const profile = computed(() => store.state.routing.query.profile)

const service = useIsolines({
  provider: props.provider,
  query: { point, profile },
  isEnabled: computed(() => props.isEnabled),
  userProjection,
  onLoad: (resultSource) => {
    if (!pointsSource.modifyingFeatures) {
      const inExtent = containsExtent(
        map.getView().calculateExtent(),
        resultSource.getExtent(),
      )
      if (!inExtent) {
        map.ext.fitToExtent(resultSource.getExtent())
      }
    }
  },
})

watch(service.isLoading, (isLoading) =>
  store.commit(MutationKey.setLoading, isLoading),
)

watch(
  point,
  (point) => {
    pointsSource.syncFeatures(() => [new Feature(new Point(point))])
  },
  { immediate: true },
)

const modify = useInteraction(
  new Modify({
    source: pointsSource,
    hitDetection: pointsLayer,
    style: [],
  }),
)

onMounted(() => {
  modify?.on(['modifystart', 'modifyend'], (event) => {
    pointsSource.modifyingFeatures = event.type === 'modifystart'
  })
})

const hoveringFeatures = ref(undefined)

watchEffect(() => {
  let newCursor = ''
  if (hoveringFeatures.value) newCursor = 'pointer'
  store.commit(MutationKey.setCursor, newCursor)
})

onMounted(() => {
  const overlaySource = modify.getOverlay().getSource()
  overlaySource.on(['addfeature', 'removefeature'], (event) => {
    hoveringFeatures.value =
      event.type === 'addfeature' ? event.feature : undefined
  })
})
</script>

<style>
.error {
  color: var(--color-red);
  --icon-color: currentColor;
}
</style>
