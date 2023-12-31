<template>
  <div class="f-row">
    <div class="map-wrapper">
      <div ref="element" class="map"></div>
      <portal-target name="map-overlay" v-if="mounted" class="map-overlay" />
    </div>

    <div style="width: 400px">
      <slot />
    </div>

    <div style="position: sticky; top: 0; width: 400px; height: 400px">
      <portal-target name="right-panel" />

      <CurrentCursor />
    </div>
  </div>
</template>

<script setup lang="ts">
import 'ol/ol.css'
import { createBrowserHistory } from 'history'
import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import View from 'ol/View'
import Vue, { onMounted, ref, provide, type Ref } from 'vue'
import { getCurrentInstance } from 'vue'

import { createMapExt } from './components/identification/createMapExt'

import CurrentCursor from '@/components/CurrentCursor.vue'
import { mapKey } from '@/composables/useOlMap'

const props = defineProps({
  history: Object,
})

const element = ref()
const mounted = ref(false)

function createMap({ element }: { element: Ref<Element> }) {
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([14.383347807482387, 50.10892209142125]),
      zoom: 15,
      constrainOnlyCenter: true,
      smoothExtentConstraint: false,
    }),
    moveTolerance: 10,
  })

  map.ext = createMapExt(map)

  provide(mapKey, map)

  onMounted(() => {
    map.setTarget(element.value)
    setTimeout(() => {
      map.getViewport().__mapInstance = map
      map.getViewport()?.setAttribute('data-testid', 'the-canvas')
    })

    mounted.value = true
  })

  return map
}

const map = createMap({ element })

provide('history', props.history ?? createBrowserHistory())

const statusBarVisible = ref(false)
const $panel = {
  setStatusBarVisible: (visible: boolean) => {
    statusBarVisible.value = visible
  },
}
provide('panel', $panel)

const resolutionsToScales = {}
map.getView().getScale = function () {
  return resolutionsToScales[this.getResolution()]
}

// Remove in Vue 3 - use provide/inject instead
getCurrentInstance().proxy.$root.$panel = $panel
// Remove in Vue 3
Vue.prototype.$map = map
</script>

<style>
.map-wrapper {
  position: sticky;
  top: 0;
  width: 400px;
  height: 400px;
}
.map {
  position: relative;
  width: 100%;
  height: 100%;
}
.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 400px;
  height: 400px;
}
</style>
