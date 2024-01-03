<template>
  <div>
    <div class="section f-col">
      <div class="f-row f-justify-end">
        <v-btn
          @click="() => store.commit(MutationKey.clearPoints)"
          icon
          :title="tr.Clear"
          :disabled="initializedPoints.length === 0"
        >
          <v-icon name="x" />
        </v-btn>
      </div>

      <div class="f-col" v-if="profiles.length > 1">
        <div v-if="profiles.length > 3">
          <v-select
            class="f-grow"
            itemText="label"
            :value="selectedProfile"
            item-value="id"
            @input="store.commit(MutationKey.setProfile, $event)"
          />
        </div>
        <div v-else>
          <TextTabsHeader
            class="f-grow"
            :value="selectedProfile"
            item-value="id"
            @input="store.commit(MutationKey.setProfile, $event)"
            :items="profiles"
          />
        </div>
      </div>

      <div v-if="roundtripState.enabled" class="query-row-form px-2">
        <RouteQueryRow
          :key="store.state.routing.query.points.features[0].properties.id"
          :index="0"
          :point="store.state.routing.query.points.features[0]"
          :moveWaypoint="moveWaypoint"
          :askForFitMap="askForFitMap"
          :canAdd="false"
          :canMove="false"
        />

        <div class="f-row-ac">
          <v-slider
            :value="store.state.routing.query.roundtrip.value"
            @input="
              (value) => {
                shouldFitAfterRecalculate = true

                store.commit(MutationKey.setRoundtrip, {
                  value: parseInt(value),
                })
              }
            "
            :min="250"
            :max="100000"
            :step="1"
            hide-range-labels
            :format="(v) => formatDistance(v)"
            :label="tr.Distance"
            class="f-grow"
          />
          <div class="value">
            {{ formatDistance(store.state.routing.query.roundtrip.value, -1) }}
          </div>
        </div>
      </div>
      <div ref="el" v-else class="query-row-form px-2">
        <RouteQueryRow
          v-for="(element, index) in store.state.routing.query.points.features"
          :key="element.properties.id"
          :index="index"
          :point="element"
          :moveWaypoint="moveWaypoint"
          :askForFitMap="askForFitMap"
          :canAdd="true"
          :canMove="true"
        />
      </div>
    </div>

    <div class="section f-row f-justify-end">
      <v-btn
        v-if="!roundtripState.enabled"
        class="small"
        @click="store.commit(MutationKey.reversePoints)"
        :title="tr.Reverse"
        :disabled="initializedPoints.length < 1"
      >
        <v-icon name="arrows-down-up" />
        <translate>Change direction</translate>
      </v-btn>
      <v-btn
        v-if="initializedPoints.length === 1 && roundtripSupported"
        class="small"
        :color="roundtripState.enabled ? 'primary' : ''"
        @click="
          () => {
            shouldFitAfterRecalculate = true
            store.commit(MutationKey.setRoundtrip, {
              enabled: !roundtripState.enabled,
            })
          }
        "
        :title="tr.Roundtrip"
      >
        <v-icon name="path" />
        <translate>Roundtrip</translate>
      </v-btn>
    </div>

    <div class="f-col-ac" v-if="debouncedLoading">
      <div class="loading-spinner">
        <v-spinner :size="35" />
      </div>
    </div>

    <div class="routing-result" :class="{ loading: debouncedLoading }">
      <div
        class="section px-2 error f-col-ac my-4"
        v-if="routingService.error.value"
      >
        <span>{{ getFormattedErrorMessage(routingService.error.value) }}</span>
        <span>
          <v-btn
            @click="
              () => {
                shouldFitAfterRecalculate = true
                routingService.refetch()
              }
            "
          >
            <translate>Try again</translate>
          </v-btn>
        </span>
      </div>

      <div v-if="queryResult" class="section">
        <div v-if="selectedPath">
          <div class="px-2">
            <ul
              v-if="
                featureConfig.settings.alternatives &&
                queryResult.paths.length > 0
              "
              class="path-list"
            >
              <li
                v-for="(path, index) in queryResult.paths"
                :key="index"
                :class="{
                  path: true,
                  'selected-path': index === selectedPathIndex,
                }"
                @click="
                  () => {
                    selectedPathIndex = index
                    fitToSelectedPath()
                  }
                "
                :aria-label="
                  index === selectedPathIndex ? tr.SelectedPath : tr.SelectPath
                "
              >
                <div class="path-time">{{ formatDuration(path.time) }}</div>
                <div class="path-distance">
                  {{ formatDistance(path.distance) }}
                </div>
                <div class="path-label" v-if="path.label">{{ path.label }}</div>
              </li>
            </ul>
          </div>

          <div class="section f-row action-button-group">
            <v-btn
              v-if="featureConfig.settings.instructions"
              :disabled="!selectedPath.instructions.length"
              @click="showInstructions = !showInstructions"
              :title="tr.Instructions"
              :color="showInstructions ? 'primary' : ''"
              class="flat icon action-button"
            >
              <v-icon name="list-bullets" />
            </v-btn>
            <v-btn
              v-if="selectedPath && featureConfig.settings.elevation"
              :disabled="!selectedPath.elevations.length"
              @click="showElevationProfile = !showElevationProfile"
              :title="tr.ElevationProfile"
              :color="showElevationProfile ? 'primary' : ''"
              class="flat icon action-button"
            >
              <v-icon name="chart-line" />
            </v-btn>
            <v-btn
              v-if="selectedPath"
              @click="handleDownload"
              :title="tr.DownloadGPX"
              class="flat icon action-button"
            >
              <v-icon name="download" />
            </v-btn>
            <v-btn
              v-if="selectedPath"
              @click="handleShare"
              :title="tr.Share"
              class="flat icon action-button"
            >
              <v-tooltip slot="tooltip" :value="copied" manualMode>
                <translate>Link copied.</translate>
              </v-tooltip>
              <v-icon name="share" />
            </v-btn>
          </div>

          <div
            class="elevation-profile-content"
            v-if="featureConfig.settings.elevation && showElevationProfile"
          >
            <AsyncElevationProfile
              :distances="selectedPath.distances"
              :elevations="selectedPath.elevations"
              :ascend="selectedPath.ascend"
              :descend="selectedPath.descend"
              @hover="hoverElevationProfile"
              @click="clickElevationProfile"
              :color="selectedPath.color"
            />
          </div>

          <Instructions
            v-if="showInstructions && featureConfig.settings.instructions"
            :selectedPath="selectedPath"
            :instructions="selectedPath.instructions"
            :showSigns="featureConfig.settings.instructionsSigns"
            @pan="
              panToExtent(
                map,
                $event,
                { duration: 200 },
                transformExtent(
                  selectedPath.bbox,
                  gpsProjection,
                  userProjection,
                ),
              )
            "
          />

          <div
            v-if="queryResult.atribution?.length"
            class="px-2 py-4 attribution"
          >
            &copy; {{ queryResult.atribution.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import bbox from '@turf/bbox'
import { toValue, useClipboard } from '@vueuse/core'
import { useSortable } from '@vueuse/integrations/useSortable'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Point } from 'ol/geom'
import { fromLonLat, transformExtent } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import {
  watchEffect,
  watch,
  computed,
  ref,
  shallowRef,
  onMounted,
  onUnmounted,
} from 'vue'

import Instructions from './Instructions.vue'
import RouteQueryRow from './RouteQueryRow.vue'
import { useProvider } from '../composables/useGetService'
import { useInteractions } from '../composables/useInteractions'
import { useIsolines } from '../composables/useIsolines'
import { usePointsLayer } from '../composables/usePointsLayer'
import { useVectorLayer } from '../composables/useVectorLayer'
import { gpsProjection } from '../constants'
import { accessPointsStyle, elevationProfileCursorStyle } from '../mapStyles'
import { MutationKey } from '../store'
import { formatDistance, formatDuration } from '../util/formatters'
import { getFeatureConfig } from '../util/getFeatureConfig'
import { getFormattedErrorMessage } from '../util/getFormattedErrorMessage'
import { panToExtent } from '../util/map'

import { useOlMap } from '@/composables/useOlMap'
import type { BaseService } from '@/modules/services/base/service'
import { useGeocodeService } from '@/modules/services/composables/useGeocodeService'
import { useRoutingService } from '@/modules/services/composables/useRoutingService'
import { useGettext } from '@/modules/vue-gettext'
import { useStore } from '@/store/typed'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'

const { $gettext } = useGettext()

const props = defineProps<{
  routeProvider: BaseService
  isolinesProvider?: BaseService
  enabled: boolean
}>()

const store = useStore()

const map = useOlMap()

const tr = computed(() => {
  return {
    ElevationProfile: $gettext('Elevation profile'),
    Clear: $gettext('Clear'),
    Reverse: $gettext('Reverse'),
    CloseElevationProfile: $gettext('Close elevation profile'),
    SelectedPath: $gettext('Selected path'),
    SelectPath: $gettext('Select path'),
    Roundtrip: $gettext('Roundtrip'),
    Distance: $gettext('Distance'),
    Instructions: $gettext('Instructions'),
    DownloadGPX: $gettext('Download GPX'),
    Share: $gettext('Share'),
  }
})

const showIsoline = ref(true)
const showInstructions = ref(true)
const showElevationProfile = ref(true)
const shouldFitAfterRecalculate = ref(false)
const selectedPathIndex = shallowRef()

const config = store.state.routing.config
const featureConfig = getFeatureConfig(config, 'route')
const profiles =
  config.providers[featureConfig.provider]?.settings.profiles ?? []

const queryPoints = computed(() => store.state.routing.query.points)
const selectedProfile = computed(() => store.state.routing.query.profile)
const roundtripSupported = computed(
  () => props.routeProvider.getFeatureParams('route').roundtrip,
)
const roundtripState = computed(() => store.state.routing.query.roundtrip)

const userProjection = store.state.project.config.projection

const routingService = useRoutingService(
  () => props.routeProvider,
  {
    points: queryPoints,
    profile: selectedProfile,
    roundtrip: roundtripState,
  },
  {
    userProjection,
    onSuccess: (newData) => {
      selectedPathIndex.value = typeof newData !== 'undefined' ? 0 : undefined

      if (shouldFitAfterRecalculate.value) {
        fitToSelectedPath()
        shouldFitAfterRecalculate.value = false
      }
    },
    onError: () => {
      selectedPathIndex.value = undefined
      shouldFitAfterRecalculate.value = false
    },
  },
)

function askForFitMap() {
  shouldFitAfterRecalculate.value = true

  if (initializedPoints.value.length < 1) return

  const extent = bbox({
    type: 'FeatureCollection',
    features: initializedPoints.value,
  })

  map.ext.fitToExtent(extent, { maxZoom: 16 })
}

const queryResult = routingService.data

watch(routingService.isLoading, (isLoading) =>
  store.commit(MutationKey.setLoading, isLoading),
)

const debouncedLoading = ref(false)
// delay before showing spinner to prevent flickering
let timeoutId: number | null = null
watch(routingService.isLoading, (isLoading) => {
  if (isLoading) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debouncedLoading.value = isLoading
    }, 200)
  } else {
    if (timeoutId) clearTimeout(timeoutId)
    debouncedLoading.value = isLoading
  }
})

const selectedPath = computed(() => {
  return queryResult.value?.paths[selectedPathIndex.value]
})

function moveWaypoint(fromIndex: number, toIndex: number) {
  store.commit(MutationKey.movePoint, { fromIndex, toIndex })
}

async function handleDownload() {
  if (queryResult.value) {
    try {
      await props.routeProvider.downloadGpxPath(
        queryResult.value,
        selectedPathIndex.value,
      )
    } catch (err) {
      console.log(err)
    }
  }
}

const {
  copy: copyPermalink,
  copied,
  isSupported: isCopySupported,
} = useClipboard({ copiedDuring: 2500 })
async function handleShare() {
  const url = map.ext.createPermalink()
  if (isCopySupported && url) {
    copyPermalink(url)
  }
}

const accessPathSource = new VectorSource()
useVectorLayer({
  style: accessPointsStyle,
  source: accessPathSource,
  updateWhileAnimating: true,
})

const initializedPoints = computed(
  () => store.getters['routing/initializedPoints'],
)

watch(initializedPoints, (prev, next) => {
  if (prev.length !== next.length) {
    store.commit(MutationKey.setRoundtrip, { enabled: false })
  }
})

const fromPoint = computed(
  () => initializedPoints.value?.[0]?.geometry?.coordinates,
)
useIsolines({
  provider: () => props.isolinesProvider,
  query: { point: fromPoint, profile: selectedProfile },
  userProjection,
  isEnabled: showIsoline,
})

const { pointsSource, pointsLayer, pathSource, pathLayer } = usePointsLayer()

const hoveringFeatures = ref(undefined)
useInteractions({
  pointsSource,
  pointsLayer,
  pathSource,
  pathLayer,
  selectedPathIndex,
  hoveringFeatures,
})

watchEffect(() => {
  let newCursor = 'crosshair'
  if (hoveringFeatures.value) newCursor = 'pointer'
  store.commit(MutationKey.setCursor, newCursor)
})

const reader = new GeoJSON({ featureProjection: userProjection })
watch(
  [selectedPathIndex, queryResult],
  ([selectedPathIndex, queryResult]) => {
    pathSource.clear()
    if (!queryResult) return
    queryResult.paths.forEach((path, index) => {
      const isActive = index === selectedPathIndex
      const features = reader.readFeatures(path.points)
      features.forEach((feature) => {
        feature.set('isActive', isActive)
        feature.set('pathIndex', index)
        feature.set('pathColor', path.color)
      })
      pathSource.addFeatures(features)
    })
  },
  { immediate: true },
)

watch(
  [selectedPath],
  ([selectedPath]) => {
    const points = toValue(queryPoints).features

    accessPathSource.clear()
    if (!selectedPath?.waypoints) return
    if (selectedPath?.waypoints.length !== points.length) return

    const from = selectedPath?.waypoints.map((p) =>
      fromLonLat(p, userProjection),
    )
    const to = points.map((point) => point.geometry.coordinates)

    for (var i = 0; i < from.length; i++) {
      accessPathSource.addFeature(new Feature(new LineString([from[i], to[i]])))
    }
  },
  { immediate: true },
)

async function fitToSelectedPath() {
  if (!selectedPath.value) return

  const extent = transformExtent(
    selectedPath.value.bbox,
    gpsProjection,
    userProjection,
  )

  map.ext.fitToExtent(extent)
}

const incompleteTexts = computed(() => {
  return toValue(initializedPoints).filter((p) => !p.properties.isTextAccurate)
})

const geocodeProvider = useProvider('reverseGeocode')

useGeocodeService(
  geocodeProvider,
  { texts: incompleteTexts },
  {
    userProjection,
    onSuccess: (toUpdate) => {
      if (!toUpdate) return
      for (let i = 0; i < toUpdate.length; i++) {
        const foundPointIndex = toValue(queryPoints).features.findIndex(
          (point) => point.properties.id === toUpdate[i].id,
        )
        store.commit(MutationKey.setPoint, {
          index: foundPointIndex,
          properties: {
            isTextAccurate: true,
            text: toUpdate[i].result.features[0].properties.formatted,
          },
        })
      }
    },
  },
)

const hoverFeature = new Feature()
const hoverLayerlayer = useVectorLayer({
  style: elevationProfileCursorStyle,
  source: new VectorSource({ features: [hoverFeature] }),
})

function hoverElevationProfile({ index }) {
  const point = selectedPath.value?.points.coordinates[index]
  if (point) {
    hoverFeature.setGeometry(new Point(fromLonLat(point, userProjection)))
    hoverLayerlayer.setVisible(true)
  } else {
    hoverLayerlayer.setVisible(false)
  }
}

function clickElevationProfile({ index }) {
  const point = selectedPath.value?.points.coordinates[index]
  if (point) {
    map.ext.fitToExtent(new Point(fromLonLat(point, userProjection)), {
      maxZoom: 17,
    })
  }
}

const AsyncElevationProfile = () => ({
  component: import('./ElevationProfile.vue'),
  delay: 200,
  timeout: 3000,
})

const el = ref<HTMLElement | null>(null)
useSortable(el, store.state.routing.query.points.features, {
  handle: '.handle',
  onUpdate: (e) => {
    store.commit(MutationKey.movePoint, {
      fromIndex: e.oldIndex,
      toIndex: e.newIndex,
    })
  },
})

onMounted(() => {
  // First result will fit
  shouldFitAfterRecalculate.value = true
})
onMounted(() => {
  store.commit(MutationKey.setEnabled, true)
})
onUnmounted(() => {
  store.commit(MutationKey.setEnabled, false)
})
</script>
<style scoped>
.path-list {
  margin: 0;
  margin-bottom: 0.5em;
  padding: 0;
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #eee;
  overflow: hidden;

  --color: var(--color-primary);
}
.path {
  max-width: 50%;
  display: block;
  cursor: pointer;
  padding: 5px 7px;
  background: #e6e6e6;
  flex: 1;
}
.selected-path {
  color: #fff;
  background-color: var(--color);
  border-color: var(--color);
}
.path-time {
  display: block;
  font-size: 17px;
  font-weight: bold;
}
.path-distance {
  display: block;
  font-size: 15px;
}

.path-label {
  font-size: 13px;
}

.elevation-profile-actions {
  flex-basis: 0;
}

.elevation-profile-container {
  position: relative;
  background-color: #fff;
  overflow: hidden;
}

:global(.map-container:not(.mobile)) {
  .elevation-profile-container {
    border-radius: 10px;
    border: 1px solid #aaa;
  }
}

:global(.map-container.mobile) {
  .elevation-profile-container {
    box-shadow: none;
  }
}

.elevation-profile-content {
  padding: 10px;
}

.error {
  color: var(--color-red);
  --icon-color: currentColor;
  width: 100%;
  word-break: break-word;
}

.loading {
  opacity: 0.5;
}

.loading-spinner {
  position: absolute;
  z-index: 1;
  margin: 20px;
  width: 40px;
  height: 40px;
  pointer-events: none;
}
.attribution {
  font-size: 0.8em;
  opacity: 0.8;
  text-align: center;
}
.action-button-group {
  justify-content: space-around;
  padding: 0 6px;
}

.btn.action-button {
  flex-grow: 1;
  padding: 10px 15px;
  margin: 0;
}

.btn.action-button:hover {
  background-color: rgba(17, 17, 17, 0.1);
}
.btn.action-button:active {
  background-color: rgba(17, 17, 17, 0.18);
}
</style>
