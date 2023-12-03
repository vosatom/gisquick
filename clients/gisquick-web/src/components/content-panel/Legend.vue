<template>
  <div class="legend">
    <template v-for="item in legendList">
      <div
        v-if="item.type === 'link'"
        :key="item.layer.name"
        class="item link px-2 py-2"
      >
        <strong v-text="item.layer.title"/>
        <a target="_blank" :href="item.url">Link</a>
      </div>
      <LegendJSON v-else-if="item.type === 'json'" :url="item.url" :layer="item.layer"/>
      <LegendTable v-else-if="item.type === 'table'" :data="item.legend_items"/>
      <img
        v-else
        :key="item.layer.name"
        :src="item.url"
        :srcset="item.srcset"
        :alt="item.layer.title"
      />
    </template>
  </div>
</template>

<script lang="js">
import { mapGetters } from 'vuex'
import { unByKey } from 'ol/Observable'
import debounce from 'lodash/debounce'
import LegendTable from './LegendTable'
import LegendJSON from './LegendJSON'

export default {
  components: { LegendTable, LegendJSON },
  props: {
    visible: Boolean
  },
  data () {
    return {
      legendList: []
    }
  },
  computed: {
    ...mapGetters(['visibleBaseLayer', 'visibleLayers']),
    legendLayers() {
      return [this.visibleBaseLayer, ...this.visibleLayers].filter(
        (l) => l && !l.legend_disabled && (l.drawing_order > -1 || l.custom?.legend_type) && !l.clientLayer,
      )
    },
    dpi () {
      return window.devicePixelRatio > 1 ? Math.round(92 * window.devicePixelRatio) : null
    }
  },
  watch: {
    visible (visible) {
      this.setActive(visible)
    },
    legendLayers: 'updateLegend'
  },
  mounted () {
    this.setActive(this.visible)
  },
  beforeDestroy () {
    this.setActive(false)
  },
  methods: {
    setActive (active) {
      if (active) {
        if (!this.listener) {
          this.listener = this.$map.getView().on('change:resolution', debounce(this.updateLegend, 75))
          this.updateLegend()
        }
      } else if (this.listener) {
        unByKey(this.listener)
        this.listener = null
      }
    },
    updateLegend () {
      if (!this.visible) {
        return
      }
      const source = this.$map.overlay.getSource()
      const view = this.$map.getView()
      this.legendList = this.legendLayers.map((l) => {
        if (l.custom?.legend_type === 'table') {
          return {
            layer: l,
            type: l.custom.legend_type,
            legend_items: l.custom.legend_items,
          }
        }
        if (l.custom?.legend_type === 'json') {
          const url = source.getLegendUrl(l.name, view, {
            FORMAT: 'application/json',
            SYMBOLHEIGHT: '14',
            SYMBOLWIDTH: '16'
          })
          return {
            layer: l,
            type: l.custom.legend_type,
            url: url.toString(),
          }
        }
        if (l.legend_url) {
          return {
            layer: l,
            type: 'link',
            url: l.legend_url
          }
        }
        const opts = this.dpi ? { DPI: this.dpi } : undefined
        const url = source.getLegendUrl(l.name, view, {
          ...opts,
          FORMAT: 'image/png',
          SYMBOLHEIGHT: '4',
          SYMBOLWIDTH: '6',
          LAYERFONTSIZE: '10',
          LAYERFONTBOLD: 'true',
          ITEMFONTSIZE: '11',
          ICONLABELSPACE: '3'
        })
        return {
          layer: l,
          type: 'image',
          url,
          srcset: window.devicePixelRatio > 1 ? `${url} ${window.devicePixelRatio}x` : null
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.legend {
  img {
    display: block;
  }
  .item {
    display: flex;
    flex-direction: column;
    &.link {
      font-size: 14px;
    }
  }
}
</style>
