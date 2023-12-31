<template>
  <div>
    <div v-if="feature">
      <div class="panel">
        <h1 class="mb-2">{{ feature.get('name') }}</h1>
        <div class="mb-4">
          <p v-if="feature.get('desc')" v-html="feature.get('desc')"></p>
          <p
            v-if="feature.get('desc_extra')"
            v-html="feature.get('desc_extra')"
          ></p>
          <p v-if="feature.get('address')" v-html="feature.get('address')"></p>
        </div>

        <div class="my-2 hyperlink" v-if="feature.get('url')">
          <a
            :href="feature.get('url')"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ feature.get('url') }}
          </a>
        </div>

        <template v-if="relations && relations.length > 0">
          <div
            v-for="relation in relations"
            :key="relation.name"
            class="relations"
          >
            <div v-if="relationsData" class="f-col-ac my-2">
              <PoiImageGroup
                v-if="
                  relation.layer.name.includes('webmap_photo_') &&
                  relationsData[relation.name]
                "
                :data="relationsData[relation.name]"
                :layer="layer"
                :relation="relation"
                :project="project"
              />
              <div v-else>
                <component
                  v-for="(f, fi) in relationsData[relation.name]"
                  :key="`${relation.name}-${fi}`"
                  :is="relation.component"
                  :feature="f"
                  :layer="relation.layer"
                  :project="project"
                  class="nested"
                />
              </div>
            </div>
          </div>
        </template>

        <div class="f-row f-wrap btn-row">
          <v-btn
            tag="a"
            :href="mapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            :disabled="!mapsUrl"
            :title="tr.OpenInGoogleMaps"
          >
            <v-icon name="google-logo" />
          </v-btn>

          <v-btn @click="showQRCode = !showQRCode" :title="tr.ShowQRCode">
            <v-icon name="qr-code" />
          </v-btn>

          <v-btn @click="showEmbed = !showEmbed" :title="tr.Embed">
            <v-icon name="code" />
          </v-btn>
        </div>

        <QRCode :content="featureUrl" v-if="showQRCode" />

        <EmbedCode
          :feature="feature"
          v-if="showEmbed"
          @close="showEmbed = false"
        />

        <div v-if="feature.get('last_modification')" class="meta-updated py-2">
          <strong><translate>Last updated: </translate></strong>
          {{ formatDate(parseISO(feature.get('last_modification'))) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Feature } from 'ol'

import { createPermalink } from '@/modules/permalink/createPermalink'
import { computed, ref, watch } from 'vue'
import { parseISO } from 'date-fns'
import centroid from '@turf/centroid'
import { toLonLat } from 'ol/proj'
import { formatDate } from './formatDate'
import { useOlMap } from '@/composables/useOlMap'
import GeoJSON from 'ol/format/GeoJSON'
import { buffer, getCenter } from 'ol/extent'
import { useGettext } from '@/modules/vue-gettext'
import EmbedCode from '@/modules/embed/EmbedCode.vue'
import PoiImageGroup from './PoiImageGroup.vue'
import mapValues from 'lodash/mapValues'

const { $gettext } = useGettext()

const props = defineProps<{
  feature: Feature
  layer: Layer
  project: Project
  relationsData: any
}>()

const map = useOlMap()

const tr = computed(() => {
  return {
    OpenInGoogleMaps: $gettext('Open in Google Maps'),
    ShowQRCode: $gettext('Show QR code'),
    Embed: $gettext('Embed'),
  }
})

const QRCode = () => ({
  component: import('./QRCode.vue'),
  delay: 200,
  timeout: 3000,
})

const expanded = ref({})

const relations = computed(() => {
  return props.layer.relations?.map((r) => {
    const component = PoiImageGroup
    return {
      name: r.name,
      layer: r.referencing_layer,
      component,
    }
  })
})

watch(
  () => props.layer,
  async (layer) => {
    const _expanded = {}
    layer.relations?.forEach((r) => {
      _expanded[r.name] = true
    })
    expanded.value = _expanded
  },
  { immediate: true },
)

const showQRCode = ref(false)
const showEmbed = ref(false)

const geojson = new GeoJSON()
const mapsUrl = computed(() => {
  const geoFeature = geojson.writeFeatureObject(props.feature)
  if (!geoFeature.geometry) return ''
  const pointFeature = centroid(geoFeature)
  if (pointFeature) {
    const name = props.feature.get('name')
    return `https://www.google.com/maps?q=${name}@${toLonLat(
      pointFeature.geometry.coordinates,
    ).reverse()}&z=18&t=h`
  }
  return ''
})

const featureUrl = computed(() =>{
  const queryParams = map.ext.getPermalinkQueryParams()
  const keepKeys = ['features', 'selectedFeature', 'displayMode']
  return createPermalink(window.location.href, mapValues(queryParams, (value, key) => (keepKeys.includes(key) ? value : undefined)))
})

watch(
  () => props.feature,
  () => {
    if (!map?.ext?.centerOn) return
    const resolution = map.getView().getResolution()
    const geometry = props.feature.getGeometry()
    if (!geometry || !resolution) return
    const extent = geometry.getExtent()
    const bufferEx = (map.getSize()?.[0] ?? 0) * 0.05 * resolution
    const final = buffer(extent, bufferEx)
    map.ext.centerOn(getCenter(final), { whenNeeded: true })
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped>
.panel {
  padding: 10px;
  overflow-wrap: break-word;

  h1 {
    font-size: 23px;
    text-wrap: balance;
  }

  a {
    font-size: 15px;
    color: var(--color-primary);
  }
}

.meta-updated {
  font-size: 14px;
}

.hyperlink {
  line-break: anywhere;
}

.btn-row {
  margin: 0;

  .btn {
    margin: 0;
    padding: 0;
  }
}

@media (min-width: 500px) {
  .panel {
    width: 400px;
    h1 {
      font-size: 25px;
    }
  }
}
</style>
