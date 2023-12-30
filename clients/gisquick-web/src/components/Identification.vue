<template>
  <div>
    <portal to="main-panel">
      <div class="identification-tool light f-row f-align-start" key="identification">
        <v-select
          class="flat f-grow"
          :label="tr.Layer"
          item-text="title"
          item-value="name"
          :value="identificationLayer"
          :items="options"
          @input="$emit('update:identificationLayer', $event)"
        />
        <v-menu
          :aria-label="tr.Menu"
          transition="slide-y"
          align="rr;bb,tt"
          :items="displayModes"
          @confirm="$emit('update:displayMode', $event.value)"
        >
          <template v-slot:activator="{ toggle }">
            <v-btn
              :aria-label="tr.Menu"
              class="icon small"
              @click="toggle"
            >
              <v-icon name="menu-dots"/>
            </v-btn>
          </template>
        </v-menu>
      </div>
    </portal>

    <identify-pointer v-if="!editMode" @click="onClick"/>
    <features-viewer :features="displayedFeatures"/>
    <point-marker
      :coords="mapCoords"
      :error="!!tasks.fetchFeatures.error"
      :loading="tasks.fetchFeatures.pending"
    />

    <template v-if="layersFeatures.length">
      <portal to="right-panel">
        <info-panel
          v-if="displayMode === 'info-panel' || displayMode === 'both'"
          class="mx-1 mb-2 shadow-2"
          :features="displayedFeatures"
          :layer="displayedLayer"
          :layers="resultLayers"
          :selected="selection"
          :editMode.sync="editMode"
          @selection-change="selection = $event"
          @close="clearResults"
          @delete="onFeatureDelete"
          @edit="onFeatureEdit"
        />
      </portal>
      <portal to="bottom-panel">
        <features-table
          v-if="displayMode === 'table' || displayMode === 'both'"
          class="light"
          :data="layersFeatures"
          :selected="selection"
          @selection-change="selection = $event"
          @close="clearResults"
        />
      </portal>
    </template>
  </div>
</template>

<script lang="js">
import { mapState } from 'vuex'
import partition from 'lodash/partition'
import isEqual from 'lodash/isEqual'
import { fromCircle } from 'ol/geom/Polygon'
import Circle from 'ol/geom/Circle'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import { unByKey } from 'ol/Observable'

import FeaturesTable from '@/components/FeaturesTable.vue'
import InfoPanel from '@/components/InfoPanel.vue'
import PointMarker from '@/components/ol/PointMarker.vue'
import FeaturesViewer from '@/components/ol/FeaturesViewer.vue'
import { simpleStyle } from '@/map/styles'
import { layersFeaturesQuery } from '@/map/featureinfo'
import { ShallowArray } from '@/utils'
import { formatFeatures } from '@/formatters'
import { TaskState, watchTask } from '@/tasks'
import { extend } from 'ol/extent'
import IdentifyPointer from './IdentifyPointer.vue'
import { debounce } from 'lodash'

const SelectedStyle = simpleStyle({
  fill: [3, 169, 244, 0.4],
  stroke: [3, 169, 244, 0.9],
  strokeWidth: 3
})

const defaultDisplayMode = 'info-panel'

export default {
  name: 'identification',
  components: { InfoPanel, FeaturesTable, PointMarker, FeaturesViewer, IdentifyPointer },
  inject: ['history'],
  props: {
    identificationLayer: {
      type: String,
      default: ''
    },
    /** 'none' | 'table' | 'info-panel' | 'both' */
    displayMode: {
      type: String,
      default: defaultDisplayMode
    }
  },
  data () {
    return {
      mapCoords: null,
      layersFeatures: [],
      features: [],
      selection: null,
      editMode: false,
      tasks: {
        fetchFeatures: TaskState()
      },
      shouldFitToFeatures: true,
    }
  },
  computed: {
    ...mapState(['project']),
    queryableLayers () {
      return this.project.overlays.list.filter(l => l.queryable && l.visible && !l.hidden)
    },
    queryLayers () {
      return this.identificationLayer
        ? this.queryableLayers.filter(l => l.name === this.identificationLayer)
        : this.queryableLayers
    },
    options () {
      const allVisible = {
        title: this.$gettext('All visible layers'),
        name: ''
      }
      return [allVisible].concat(this.queryableLayers)
    },
    displayModes () {
      // `none` is not listed
      const options = [
        { value: 'table', text: this.$gettext('Table') },
        { value: 'info-panel', text: this.$gettext('Info Panel') },
        { value: 'both', text: this.$gettext('Table & Info Panel') },
      ]
      return options.map(item => ({ ...item, checked: this.displayMode === item.value }))
    },
    resultLayers () {
      return this.layersFeatures.map(item => item.layer)
    },
    resultItem () {
      return this.selection && this.layersFeatures.find(i => i.layer.name === this.selection.layer)
    },
    displayedLayer () {
      return this.resultItem && this.resultItem.layer
    },
    displayedFeatures () {
      return this.resultItem && this.resultItem.features
    },
    selectedFeature () {
      return this.selection && this.displayedFeatures[this.selection.featureIndex]
    },
    mapProjection () {
      return this.$map.getView().getProjection().getCode()
    },
    tr () {
      return {
        Layer: this.$gettext('Layer'),
        Menu: this.$gettext('Menu')
      }
    }
  },
  watch: {
    selectedFeature (feature, oldFeature) {
      if (oldFeature) {
        oldFeature.setStyle(null)
      }
      if (feature) {
        feature.setStyle(SelectedStyle)
      }

      this.updateUrl()
    },
    queryLayers (layers, old) {
      if (this.identificationLayer && !layers.find(l => l.name === this.identificationLayer)) {
        this.$emit('update:identificationLayer', '')
        return // watcher will be called again, so do nothing now
      }
      if (this.lastClickEvt && !isEqual(layers, old)) {
        this.onClick(this.lastClickEvt)
      }
    }
  },
  methods: {
    updateUrl() {
      const parsedUrl = new URL(window.location.href)
      const params = this.getPermalinkParams()
      if (!params) return

      if (params.features !== parsedUrl.searchParams.get('features')) {
        if (params.features) {
          parsedUrl.searchParams.set('features', params.features)
        } else {
          parsedUrl.searchParams.delete('features')
        }
      }
      if (params.selectedFeature !== parsedUrl.searchParams.get('selectedFeature')) {
        if (params.selectedFeature) {
          parsedUrl.searchParams.set('selectedFeature', params.selectedFeature)
        } else {
          parsedUrl.searchParams.delete('selectedFeature')
        }
      }

      const url = parsedUrl.toString()
      if (window.location.href !== url) {
        this.history.push(url)
      }
    },
    readFeatures (data) {
      const parser = new GeoJSON()
      return parser.readFeatures(data, { featureProjection: this.mapProjection })
    },
    async getFeaturesByWFS (query, params = {}) {
      const config = {
        params: {
          VERSION: '1.1.0',
          SERVICE: 'WFS',
          REQUEST: 'GetFeature',
          OUTPUTFORMAT: 'GeoJSON',
          ...params
        },
        headers: { 'Content-Type': 'text/xml' }
      }
      const { data } = await this.$http.post(this.project.config.ows_url, query, config)
      return this.readFeatures(data)
    },
    async getFeatureById (fid) {
      const params = {
        VERSION: '1.1.0',
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON',
        FEATUREID: fid,
      }
      const { data } = await this.$http.get(this.project.config.ows_url, { params })
      return this.readFeatures(data)
    },
    async getFeatureInfo (evt, layers) {
      const { map, coordinate } = evt
      const r = map.getView().getResolution()
      const s = map.overlay.getSource()
      const layersParam = layers.map(l => l.name).join(',')
      const params = {
        INFO_FORMAT: 'application/json', // 'application/vnd.ogc.gml'
        LAYERS: layersParam,
        QUERY_LAYERS: layersParam,
        FEATURE_COUNT: layers.length
      }
      const projCode = map.getView().getProjection().getCode()
      const url = s.getFeatureInfoUrl(coordinate, r, projCode, params)
      // const qParams = new URLSearchParams(u.split('?', 2)[1])
      // this.$http.get(url)
      // this.$http.get(this.project.config.ows_url, { params: qParams })
      const { data } = await this.$http.get(url)
      return this.readFeatures(data)

    },
    async onClick (evt) {
      const { map, pixel, coordinate } = evt
      this.mapCoords = coordinate
      this.lastClickEvt = Object.freeze({ map, pixel, coordinate })
      const [wfsLayers, fiLayers] = partition(this.queryLayers, l => l.attributes)
      const tasks = []
      if (fiLayers.length) {
        tasks.push(this.getFeatureInfo(evt, fiLayers))
      }
      if (wfsLayers.length) {
        const pixelRadius = 8
        const radius = Math.abs(map.getCoordinateFromPixel([pixel[0] + pixelRadius, pixel[1]])[0] - coordinate[0])
        const geom = {
          geom: fromCircle(new Circle(coordinate, radius), 6),
          projection: this.mapProjection
        }
        const query = layersFeaturesQuery(wfsLayers, geom)
        tasks.push(this.getFeaturesByWFS( query, { 'MAXFEATURES': 10 }))
      }
      this.mapCoords = coordinate
      const features = await this.fetchFeatures(tasks)
      this.setFeatures(features)
    },
    /* Fetch multiple features by id in single request. (It would require to know id/pk field name) */
    /*
    queryFeaturesByIds (ids) {
      const queryableLayers = this.project.overlays.list.filter(l => l.queryable)
      const layersQueries = {}
      ids.forEach((id) => {
        const [layername, fid] = id.split('.')
        const layer = queryableLayers.find(l => l.name === layername)
        if (layer) {
          if (!layersQueries[layername]) {
            layersQueries[layername] = [fid]
          } else {
            layersQueries[layername].push(fid)
          }
        }
      })
      const queries = Object.entries(layersQueries).map(([layername, ids]) => {
        const l = this.project.overlays.list.find(l => l.name === layername)
        const filters = [{
          attribute: '???',
          operator: ids.length === 1 ? '=' : 'IN',
          value: ids.join(',')
        }]
        return formatLayerQuery(l, null, filters)
      })
      return getFeatureQuery(queries)
    },
    */
    /**
     * @returns {Promise<Feature[]>}
     */
    async fetchFeatures (tasks) {
      const task = Promise.allSettled(tasks)
      const res = await watchTask(task, this.tasks.fetchFeatures)
      this.tasks.fetchFeatures.error = res.some(i => i.status === 'rejected')
      const features = [].concat(...res.filter(i => i.value).map(i => i.value))
      return features
    },
    setFeatures (features, selectedFid) {
      const categorizedFeatures = this.categorize(features)
      const items = this.tableData(categorizedFeatures)
      this.layersFeatures = items
      this.features = features

      // sort this.features by fid to match order of items (using localeCompare)
      if (this.features) {
        this.features.sort((a, b) => a.getId().localeCompare(b.getId()))
      }

      if (items.length) {
        let selectedLayer = this.selection?.layer
        let index = selectedLayer ? Math.max(0, items.findIndex(i => i.layer.name === selectedLayer)) : 0
        let featureIndex = 0

        if (selectedFid) {
          const parsedFid = selectedFid.split('.')
          selectedLayer = parsedFid[0]
          index = selectedLayer ? Math.max(0, items.findIndex(i => i.layer.name === selectedLayer)) : 0
          featureIndex = items[index].features.findIndex(f => f.getId() === selectedFid)
        }

        this.selection = {
          layer: items[index].layer.name,
          featureIndex
        }
      } else {
        this.selection = null
      }

      if (this.shouldFitToFeatures) {
        this.fitToFeatures(features)
        this.shouldFitToFeatures = false
      }

      return features
    },
    fitToFeatures: debounce(function fitToFeatures(features) {
      if (features.length === 1) {
        this.$map.ext.zoomToFeature(features[0], { duration: 0 })
      } else if (features.length > 1) {
        const extents = features.map(f => f.getGeometry().getExtent())
        const finalExtent = extents.reduce((prev, current) => extend(prev, current), extents[0])
        this.$map.ext.fitToExtent(finalExtent, { duration: 0 })
      }
    }),
    clearResults () {
      this.selection = null
      this.mapCoords = null
      this.layersFeatures = []
      this.editMode = false
      this.lastClickEvt = null
    },
    categorize (features) {
      // (WFS layer name cannot contain space character)
      const WfsToLayerName = {}
      this.queryableLayers.forEach(l => {
        WfsToLayerName[l.name.replace(/ /g, '_')] = l.name
      })
      // group features by layer name
      const layersFeatures = {}
      if (features.length > 0) {
        features.forEach(feature => {
          if (feature instanceof Feature) {
            const fid = feature.getId()
            const layername = WfsToLayerName[fid.substring(0, fid.lastIndexOf('.'))]
            if (layername) {
              if (!layersFeatures[layername]) {
                layersFeatures[layername] = []
              }
              layersFeatures[layername].push(feature)
            }
          }
        })
      }
      return layersFeatures
    },
    tableData (groupedFeatures) {
      const matchedLayers = Object.keys(groupedFeatures)
      return this.queryableLayers
        .filter(l => matchedLayers.includes(l.name))
        .map(l => ({
          layer: l,
          features: ShallowArray(formatFeatures(this.project, l, groupedFeatures[l.name]))
        }))
    },
    onFeatureDelete (feature) {
      this.editMode = false
      // update list of features and selection
      const currentLayerFeatures = this.resultItem.features.filter(f => f !== feature)
      if (currentLayerFeatures.length) {
        this.resultItem.features = currentLayerFeatures
        this.selection.featureIndex = 0
      } else {
        this.layersFeatures = this.layersFeatures.filter(i => i.layer !== this.resultItem)
        if (this.layersFeatures.length) {
          this.selection = {
            layer: this.layersFeatures[0].layer.name,
            featureIndex: 0
          }
        } else {
          this.selection = null
        }
      }
      this.$map.ext.refreshOverlays()
    },
    async onFeatureEdit (feature) {
      const fid = feature.getId()
      const index = this.resultItem.features.findIndex(f => f.getId() === fid)
      const task = this.getFeatureById(fid)
      const features = await watchTask(task, this.tasks.fetchFeatures)
      if (this.tasks.fetchFeatures.success) {
        formatFeatures(this.project, this.displayedLayer, features)
        const updatedFeature = features[0]
        if (updatedFeature) {
          // this.displayedFeatures.splice(index, 1, updatedFeature)
          this.$set(this.displayedFeatures, index, updatedFeature)
        }
        this.$map.ext.refreshOverlays()
      }
    },
    getPermalinkParams () {
      if (this.selection) {
        const features = this.features.map(f => f.getId())
        const selectedFeature = this.displayedFeatures[this.selection.featureIndex].getId()
        const params = {
          features: features.join(','),
          selectedFeature: selectedFeature === features[0] ? undefined : selectedFeature,
          displayMode: this.displayMode !== defaultDisplayMode ? this.displayMode : undefined,
        }
      
        return params
      }
    },
    async loadPermalink (params) {
      const { extent: originalExtent, features: initialFeatureIds, selectedfeature, displaymode: displayMode } = params
      this.editMode = false
      if (!initialFeatureIds) {
        this.selection = null
        this.layersFeatures = []
        return
      }
      if (displayMode) {
        this.$emit('update:displayMode', displayMode)
      }
      const featuresArray = initialFeatureIds.split(',')
      const tasks = [await this.getFeatureById(featuresArray.join(','))]
      const features = await this.fetchFeatures(tasks)
      this.setFeatures(features, selectedfeature)
    }
  }
}
</script>

<style lang="scss" scoped>
.identification-tool {
  .menu {
    .btn {
      margin: 4px;
    }
  }
}
.info-panel {
  flex: 0 1 auto;
}
</style>
