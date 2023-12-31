<template>
  <div style="display: flex">
    <div style="width: 400px; height: 400px" ref="element"></div>
    <slot />
    <div style="width: 400px">
      <portal-target name="main-panel" />
      <portal-target name="right-panel" />
      <portal-target name="bottom-panel" />
    </div>
    <CurrentCursor />
  </div>
</template>

<script setup lang="ts">
import 'ol/ol.css'
import { createBrowserHistory } from 'history'
import Vue, { onMounted, ref, provide } from 'vue'

import { createMapExt } from './createMapExt'

import CurrentCursor from '@/components/CurrentCursor.vue'
import { mapKey } from '@/composables/useOlMap'
import { createMap } from '@/map/map-builder'
import config from '@/modules/storybook/mocks/project-mnk.json'
import { useStore } from '@/store/typed'
const store = useStore()

const props = defineProps({
  history: Object,
})

const mapConfig = {
  project: config.ows_project,
  baseLayers: store.state.project.baseLayers.list,
  overlays: store.state.project.overlays.list,
  extent: config.project_extent,
  projection: config.projection,
  resolutions: config.tile_resolutions,
  scales: config.scales,
  owsUrl: config.ows_url,
  legendUrl: config.legend_url,
  mapcacheUrl: config.mapcache_url,
}

const map = createMap(
  mapConfig,
  { zoom: false, attribution: false, rotate: false },
  undefined,
)

function setVisibleLayers(layers) {
  map.overlay
    .getSource()
    .setVisibleLayers(layers.filter((l) => !l.clientLayer).map((l) => l.name))

  const clientLayers = layers.filter((l) => l.clientLayer)
  map.clientLayer.getLayers().forEach((mapLayer) => {
    const layer = clientLayers.find((l) => l.name === mapLayer.get('name'))
    if (layer) {
      mapLayer.setVisible(true)
    } else {
      mapLayer.setVisible(false)
    }
  })
}

async function update() {
  let visibleBaseLayer = mapConfig.baseLayers[0]
  const baseLayer = await map.getBaseLayer(visibleBaseLayer.name)
  baseLayer.setVisible(true)

  const extent = config.zoom_extent
  const padding = map.ext.visibleAreaPadding()
  map.getView().fit(extent, { padding })

  setVisibleLayers([mapConfig.overlays[0]])
}

update()

map.ext = createMapExt(map)

provide(mapKey, map)

const element = ref()

onMounted(() => {
  map.setTarget(element.value)
})

Vue.prototype.$map = map

provide('history', props.history ?? createBrowserHistory())
</script>
