<template>
  <div style="display: flex">
    <div style="width: 400px; height: 400px" ref="element"></div>
    <slot/>
  </div>
</template>

<script setup lang="ts">
import 'ol/ol.css'
import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import View from 'ol/View'
import Vue, { onMounted, ref, provide } from 'vue'

import { mapKey } from '@/composables/useOlMap'


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
provide(mapKey, map)

const element = ref()

onMounted(() => {
  map.setTarget(element.value)
})

Vue.prototype.$map = map
</script>
