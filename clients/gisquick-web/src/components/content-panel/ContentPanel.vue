<template>
  <div class="content-panel light">
    <div class="panel-header f-row-ac f-justify-center">
      <translate class="title">Content</translate>
    </div>
    <v-tabs-header :items="tabsItems" v-model="activeMainTab"/>
    <v-tabs class="f-grow" :items="tabsItems" v-model="activeMainTab">
      <template v-slot:topics>
        <scroll-area>
          <topics-list/>
        </scroll-area>
      </template>
      <template v-slot:base>
        <scroll-area>
          <base-layer-opacity
            class="opacity-tool mt-2"
            @touchstart.native.stop=""
            @touchend.native.stop=""
          />
          <base-layers-tree
            class="mt-2"
            :layers="project.baseLayers.tree"
            :expanded.sync="expandedBaseLayers"
            :value="visibleBaseLayerName"
            @input="setBaseLayer"
          />
        </scroll-area>
      </template>
      <template v-slot:overlays>
        <overlays-opacity
          class="opacity-tool mt-2"
          @touchstart.native.stop=""
          @touchend.native.stop=""
        />
        <scroll-area>
          <layers-tree
            class="light"
            :attribute-table-disabled="attributeTableDisabled"
            :layers="project.overlays"
            :expanded.sync="expandedOverlays"
          />
        </scroll-area>
      </template>
      <template v-slot:legend="{ visible }">
        <scroll-area class="legend-container">
          <map-legend :visible="visible"/>
        </scroll-area>
      </template>
    </v-tabs>
  </div>
</template>

<script lang="js">
import { mapState, mapGetters } from 'vuex'

import VTabs from '@/ui/Tabs.vue'
import VTabsHeader from '@/ui/TabsHeader.vue'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'
import BaseLayerOpacity from './BaseLayerOpacity.vue'
import OverlaysOpacity from './OverlaysOpacity.vue'
import BaseLayersTree from './BaseLayersTree.vue'
import LayersTree from './LayersTree.vue'
import TopicsList from './TopicsList.vue'
import MapLegend from './Legend.vue'

export default {
  name: 'content-panel',
  components: { VTabs, VTabsHeader, TextTabsHeader, MapLegend, OverlaysOpacity, BaseLayerOpacity, LayersTree, BaseLayersTree, TopicsList },
  props: {
    attributeTableDisabled: Boolean
  },
  data () {
    return {
      activeMainTab: 'overlays',
      expandedOverlays: {},
      expandedBaseLayers: {}
    }
  },
  computed: {
    ...mapState(['project']),
    ...mapGetters(['visibleBaseLayer', 'visibleLayers']),
    visibleBaseLayerName () {
      return this.visibleBaseLayer && this.visibleBaseLayer.name
    },
    topics () {
      return this.project.config.topics
    },
    hasTopics () {
      return this.topics?.length > 0
    },
    hasBaseLayers () {
      return this.project.baseLayers.list.length > 0
    },
    tabsItems () {
      return [
        this.hasTopics && { key: 'topics', icon: 'topics', label: this.$gettext('Topics') },
        this.hasBaseLayers && { key: 'base', icon: 'base-layer', label: this.$gettext('Base Layers') },
        { key: 'overlays', icon: 'overlays', label: this.$gettext('Overlay Layers') },
        { key: 'legend', icon: 'legend', label: this.$gettext('Legend') }
      ].filter(i => i)
    },
  },
  watch: {
    project: {
      immediate: true,
      handler (project) {
        // this.expandedOverlays = project.overlays.groups.map(g => g.name)
        this.expandedOverlays = project.overlays.groups.reduce((obj, g) => (obj[g.name] = true, obj), {})
        this.expandedBaseLayers = project.baseLayers.groups.reduce((obj, g) => (obj[g.name] = true, obj), {})
      }
    }
  },
  methods: {
    setBaseLayer (name) {
      this.$store.commit('visibleBaseLayer', name)
    }
  }
}
</script>

<style lang="scss" scoped>
.content-panel {
  flex: 1 1;
  display: flex;
  flex-direction: column;
  max-height: 100%;

  .tabs {
    font-size: 15px;
  }
  .layers-tree ::v-deep {
    .item {
      --icon-color: #777;
    }
  }
  .opacity-tool {
    background-color: #e7e7e7;
    background-color: #eee;
    padding: 0 5px;
  }
}
</style>
