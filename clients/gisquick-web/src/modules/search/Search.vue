<script setup lang="ts">
import { featureCollection } from '@turf/helpers'
import { toValue, useDebounce } from '@vueuse/core'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import { Point } from 'ol/geom'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { watch, watchEffect, computed, nextTick, ref, shallowRef } from 'vue'
import type { ComputedRef } from 'vue'

import { useVectorLayer } from '../routing/composables/useVectorLayer'
import { gpsProjection } from '../routing/constants'
import { styleFunction } from '../routing/mapStyles'
import { getFormattedErrorMessage } from '../routing/util/getFormattedErrorMessage'
import type { BaseService } from '../services/base/service'
import { useGettext } from '../vue-gettext'

import Identification from '@/components/Identification.vue'
import { useOlMap } from '@/composables/useOlMap'
import { formatFeatures } from '@/formatters'
import { SyncedVectorSource } from '@/modules/routing/SyncedVectorSource'
import type {
  AutocompleteItem,
  AutocompleteLookupResult,
} from '@/modules/services/base/types'
import { useAutocompleteService } from '@/modules/services/composables/useAutocompleteService'
import type { LayerList } from '@/store/interfaces'
import { useStore } from '@/store/typed'
import Autocomplete from '@/ui/Autocomplete.vue'

const { $gettext } = useGettext()

const map = useOlMap()

const store = useStore()
const userProjection = store.state.project.config.projection

const activeTool = computed(() => {
  return store.state.activeTool
})

interface Selection {
  layer: string | undefined
  featureIndex: number
}

interface LayersFeature {
  layer: LayerList | undefined
  features: Feature[]
}

const identificationTool = ref<{
  selection: Selection
  layersFeatures: LayersFeature[]
} | null>(null)

const query = ref('')
const throttledQuery = useDebounce(query, 400)

const center = () => toLonLat(map.getView().getCenter() ?? [])
const extent = () =>
  transformExtent(
    map.getView().calculateExtent(),
    userProjection,
    gpsProjection,
  )

const props = defineProps<{
  providers: { providerKey: string; provider: ComputedRef<BaseService> }[]
}>()

const searchProviders = computed(() =>
  props.providers.map((item) => ({
    providerKey: item.providerKey,
    ...useAutocompleteService(item.provider, {
      query: throttledQuery,
      center,
      extent,
    }),
  })),
)

const data = computed(() => {
  const result = []
  for (const service of searchProviders.value) {
    if (service.data.value?.features) {
      for (const item of service.data.value.features) {
        result.push({ item, providerKey: service.providerKey })
      }
    }
  }
  return featureCollection(result)
})

const isLoading = computed(() => {
  return searchProviders.value.some((item) => item.isLoading.value)
})

const error = computed(() => {
  return searchProviders.value.flatMap((item) => item.error.value || [])
})

const selectedItem = ref<AutocompleteLookupResult | undefined>(undefined)

const selectedFeatures = shallowRef<Feature[]>([])

const pointsSource = new SyncedVectorSource({})

useVectorLayer({
  source: pointsSource,
  style: styleFunction,
})

async function handleSelect(autocompleteItem?: {
  item?: AutocompleteItem['features'][number]
  providerKey: string
}) {
  if (!autocompleteItem) return
  const { item, providerKey } = autocompleteItem
  const service = searchProviders.value.find(
    (i) => i.providerKey === providerKey,
  )
  if (!service) return
  const loader = toValue(service.loader)
  if (!loader || !loader.autocompleteLookup) return
  if (!item) return

  const result = item
    ? await loader.autocompleteLookup({
        id: item.properties.id,
        item,
        autocompleteResults: toValue(service.data),
      })
    : undefined

  if (!result) return

  selectedItem.value = result

  // Handle QGIS reponse
  if (result.properties?.type === 'wfs') {
    const features = reader.readFeatures({
      ...result,
      properties: result.properties.data,
    })

    const layer = store.state.project.overlays.list.find(
      (l) => l.name === result.properties.layerName,
    )

    const layersFeatures: LayersFeature[] = [
      { layer, features: formatFeatures(store.state.project, layer, features) },
    ]
    const selection: Selection = {
      layer: result.properties.layerName,
      featureIndex: 0,
    }
    store.commit('activeTool', 'search')

    nextTick(() => {
      if (identificationTool.value) {
        identificationTool.value.layersFeatures = layersFeatures
        identificationTool.value.selection = selection
      }
    })
  } else {
    const features = reader.readFeatures({
      type: 'FeatureCollection',
      features: [result],
    })
    selectedFeatures.value = features
  }

  const extent = result.bbox
    ? transformExtent(
        result.bbox,
        gpsProjection,
        store.state.project.config.projection,
      )
    : undefined

  if (extent) {
    map.ext.fitToExtent(extent, { maxZoom: 17 })
  } else {
    map.ext.zoomToFeature(
      new Feature(
        new Point(fromLonLat(result.properties.coordinate, userProjection)),
      ),
    )
  }
}

const reader = new GeoJSON({ featureProjection: userProjection })
watch(
  selectedFeatures,
  (selectedFeatures) => {
    pointsSource.syncFeatures(() => {
      return selectedFeatures ?? []
    })
  },
  { immediate: true },
)

const autocompleteRef = ref()

watchEffect(() => {
  const text = selectedItem.value?.properties.title
  if (autocompleteRef.value) {
    autocompleteRef.value.updateTextSilent(text)
  }
})

const tr = computed(() => {
  return {
    Search: $gettext('Search...'),
    ClearSearch: $gettext('Clear search'),
  }
})

function resetSearch() {
  query.value = ''
  selectedItem.value = undefined
  selectedFeatures.value = []
  if (identificationTool.value) {
    identificationTool.value.layersFeatures = []
    identificationTool.value.selection = { featureIndex: 0, layer: undefined }
  }
}

function handleFocus($event) {
  if ($event.relatedTarget) return
  // Scroll to make space for the autocomplete dropdown on mobile with software keyboard
  if (map.ext?.scrollContent) {
    setTimeout(() => {
      map.ext.scrollContent(-250)
    }, 300)
  }
}
</script>

<template>
  <div class="py-2 search-container">
    <Autocomplete
      ref="autocompleteRef"
      :placeholder="tr.Search"
      :items="data?.features ?? []"
      @text:update="query = $event"
      :loading="isLoading"
      highlight-fields="item.properties.title"
      @input="handleSelect"
      @focus="handleFocus"
    >
      <template #prepend><v-icon name="magnifier" class="mx-2" /></template>

      <template v-slot:item="{ html, item }">
        <div class="item f-row f-grow">
          <div class="f-grow">
            <span class="address" v-html="html['item.properties.title']" />

            <div v-if="item.item.properties.layerName" style="opacity: 0.6">
              {{
                store.state.project?.overlays?.list?.find(
                  (layer) => layer.name === item.item.properties.layerName,
                )?.title
              }}
            </div>
          </div>
        </div>
      </template>

      <template #append v-if="selectedItem">
        <v-btn @click="resetSearch" class="icon flat" :aria-label="tr.ClearSearch">
          <v-icon name="x" />
        </v-btn>
      </template>
    </Autocomplete>

    <div class="section error" v-if="error">
      {{ getFormattedErrorMessage(error) }}
    </div>

    <Identification
      v-if="activeTool === 'search'"
      ref="identificationTool"
      @close="$store.commit('activeTool', null)"
      identificationLayer=""
      displayMode="both"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-container {
  min-height: 100%;
  position: sticky;
  top: 0;
  background: var(--popup-bg);
}
.autocomplete {
  margin: 0;
  :deep(.input) {
    outline: none;
    border: none;
    flex-grow: 1;
    font-size: 15px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
  }
}
.popup-list {
  border: 1px solid black;

  :deep(.item) {
    outline: none;
    border: 1px solid;
    border-color: transparent;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &.highlighted {
      border-color: var(--color);
      background-color: rgba(var(--color-rgb), 0.04);
    }
  }
}

.error {
  color: var(--color-red);
  --icon-color: currentColor;
}
</style>
