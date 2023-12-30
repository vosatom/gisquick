<template>
  <div class="map-container mobile f-col light">
    <div class="map-wrapper" ref="mapViewport">
      <div ref="mapEl" class="map" />
    </div>

    <div class="main-content" ref="mobileMapViewport">
      <div class="main-content-overlay"></div>
      <div class="main-panel f-col" ref="mobileMapPanel">
        <div
          class="visible-container main-content-overlay-content main-content-overlay-content--left"
        >
          <scale-line />
        </div>
        <div
          class="visible-container main-content-overlay-content main-content-overlay-content--right"
        >
          <map-attributions class="map-attributions" />
          <map-control />
        </div>

        <div class="panel-content f-col">
          <div class="app-handle-wrapper dark">
            <div class="app-handle"></div>
          </div>
          <div class="app-toolbar dark f-row-ac">
            <v-btn
              v-for="tab in tabsHeaderItems"
              :key="tab.name"
              class="icon flat"
              @click="toggleTab(tab)"
              :color="activeTabObj?.name === tab.name ? 'primary' : ''"
            >
              <v-icon :name="tab.icon" />
            </v-btn>
            <v-btn
              class="icon flat"
              :color="geolocationEnabled ? 'primary' : ''"
              @click="geolocationEnabled = !geolocationEnabled"
            >
              <v-icon name="target" />
            </v-btn>
            <div class="f-grow" />
            <app-menu class="app-menu" align="rr;tb,bt">
              <template v-slot:activator="{ toggle }">
                <v-btn aria-label="Menu" class="icon flat" @click="toggle">
                  <v-icon name="menu" />
                </v-btn>
              </template>
            </app-menu>
          </div>
        </div>
        <div>
          <portal-target name="map-overlay" class="map-overlay" />

          <div class="flexible-container" ref="mobileMapFlexibleContainer">
            <scroll-area style="height: 100%;">
              <div class="right-container f-col" v-show="activeTarget === 'right-panel'">
                <portal-target name="right-panel" class="right-panel" />
                <div class="f-grow" />
              </div>
              <div class="right-container f-col" v-show="activeTool && activeTarget === 'main-panel-top'">
                <portal-target name="main-panel-top" class="main-panel-portal" />
                <map-tools ref="tools" hidden-identification mobile />
              </div>
              <div v-show="activeTarget === 'main'">
                <div
                  v-if="activeTabObj?.component"
                  :is="activeTabObj.component"
                  v-bind.sync="activeTabObj.data"
                  @close="$store.commit('activeTool', null)"
                  :isVisible="true"
                />
              </div>
            </scroll-area>
            <portal-target name="mobile-bottom-panel" class="mobile-bottom-panel" />
          </div>
          <location-tool v-if="geolocationEnabled" />
        </div>
      </div>
    </div>

    <search-tool/>
    <transition name="fade">
      <div v-if="isLoading" class="status m-2 shadow-2">
        <v-spinner color="primary" width="3" size="20" />
      </div>
    </transition>
  </div>
</template>

<script lang="js">
// Based on @/src/components/MobileMap.vue
import debounce from 'lodash/debounce'
import DblClickDragZoom from 'ol/interaction/DblClickDragZoom'
import { Wormhole } from 'portal-vue'
import { mapState } from 'vuex'

import AppMenu from '@/components/AppMenu.vue'
import ContentPanel from '@/components/content-panel/ContentPanel.vue'
import LocationTool from '@/components/LocationTool.vue'
import MapAttributions from '@/components/MapAttributions.vue'
import MapControl from '@/components/MapControl.vue'
import MapTools from '@/components/MapTools.vue'
import ScaleLine from '@/components/ol/ScaleLine.vue'
import SearchTool from '@/components/SearchTool.vue'
import SwipeContainer from '@/components/SwipeContainer.vue'
import Map from '@/mixins/Map'
import MNKContent from '@/modules/mnk/MNKContent.vue'
import ProjectInfoPanel from '@/modules/ProjectInfo/Sidebar.vue'
import { useInfoPanelItems } from '@/modules/ProjectInfo/useInfoPanelItems'
import RoutingPanel from '@/modules/routing/components/Sidebar.vue'

const headingHeight = 65
const bottomPadding = 70
const SCROLL_THRESHOLD = 150

export default {
  name: 'Map',
  mixins: [Map],
  components: {
    AppMenu,
    ContentPanel,
    ScaleLine,
    MapAttributions,
    MapControl,
    MapTools,
    SwipeContainer,
    LocationTool,
    MNKContent,
    SearchTool,
  },
  refs: ['tools'],
  setup() {
    return { infoPanelItems: useInfoPanelItems() }
  },
  data() {
    return {
      geolocationEnabled: false,
    }
  },
  computed: {
    ...mapState(['activeTool', 'activeTab', 'routing']),
    transports() {
      return Wormhole?.transports
    },
    activeTarget() {
      if (this.transports?.['right-panel']?.length > 0) {
        return 'right-panel'
      }
      if (this.transports?.['main-panel-top']?.length > 0) {
        return 'main-panel-top'
      }
      return 'main'
    },
    toolsMenuItems() {
      const tools = (this.$refs.tools && this.$refs.tools.items) || []
      return tools.filter((t) => !t.disabled && t.icon)
    },
    tabItems() {
      return [
        {
          name: 'info',
          icon: 'legend',
          label: this.$gettext('Info'),
          show: this.infoPanelItems.length > 0,
          component: ProjectInfoPanel,
          data: { infoPanelItems: this.infoPanelItems },
        },
        {
          name: 'layers',
          icon: 'base-layer',
          label: this.$gettext('Layers'),
          show: true,
          component: ContentPanel,
        },
        {
          name: 'routing',
          icon: 'path',
          label: this.$gettext('Routing'),
          show: this.$store.state.routing.config?.features?.route?.enabled ?? false,
          component: RoutingPanel,
        },
        ...this.toolsMenuItems,
      ]
    },
    tabsHeaderItems() {
      return this.tabItems.filter((i) => i.show !== false)
    },
    activeTabObj() {
      return (
        this.activeTab && (this.tabsHeaderItems.find((t) => t.name === this.activeTab) ?? this.tabsHeaderItems[0])
      )
    },
  },
  created() {
    this.$root.$panel = {
      setStatusBarVisible: () => {},
    }
  },
  mounted() {
    const mobileMapViewport = this.$refs.mobileMapViewport
    const map = this.$map
    const originalFitToExtent = map.ext.fitToExtent
    const originalZoomToFeature = map.ext.zoomToFeature

    function coordinateWithPadding(coordinate, padding, resolution) {
      const result = coordinate.concat()
      result[0] += (-padding[3] * resolution + padding[1] * resolution) / 2
      result[1] += (-padding[2] * resolution + padding[0] * resolution) / 2
      return result
    }

    function futureAreaPadding(scrollTop) {
      const { top, right, bottom, left } = mobileMapViewport.getBoundingClientRect()
      let _bottom = window.innerHeight - bottom
      let _right = window.innerWidth - right
      if (window.innerWidth > 501) {
          _right = window.innerWidth / 2
      } else {
        if (scrollTop) {
          _bottom = _bottom + scrollTop + bottomPadding
        }
      }

      return [top, _right, _bottom, left]
    }

    Object.assign(map.ext, {
      fitToExtent: (extent, options = {}) => {
        const wanted = this.scrollToPercent(1/3)
        let newOptions = { ...options, duration: 200, maxZoom: 18 }
        if (typeof wanted !== 'undefined') {
          const padding = futureAreaPadding(wanted)
          newOptions.padding = padding
        }
        originalFitToExtent(extent, newOptions)
      },
      zoomToFeature: (feature, options = {}) => {
        const wanted = this.scrollToPercent(1/3)
        let newOptions = { ...options, duration: 200, maxZoom: 18 }
        if (typeof wanted !== 'undefined') {
          const padding = futureAreaPadding(wanted)
          newOptions.padding = padding
        }
        originalZoomToFeature(feature, newOptions)
      },
      scrollContent: (top) => {
        this.scrollTo(top)
      },
      scrollToPercent: (percent, threshold) => {
        return this.scrollToPercent(percent, threshold)
      },
      /**
       * Center the map on the given coordinates, but keep the same zoom.
       * Scroll if needed.
       */
      centerOn: (coordinate, options = {}) => {
        const wanted = map.ext.scrollToPercent?.(0.5)

        if (options.whenNeeded && typeof wanted === 'undefined') {
          return
        }

        const padding = futureAreaPadding(wanted)
        const center = coordinateWithPadding(
          coordinate,
          padding,
          map.getView().getResolution(),
        )

        map.getView().animate({
          duration: options.duration || 200,
          center,
        })
      },
    })

    const updateMapSize = debounce(() => {
      this.$map.updateSize()
      updateScroll()
    }, 100)
    window.addEventListener('resize', updateMapSize)
    this.$once('hook:beforeDestroy', () =>
      window.removeEventListener('resize', updateMapSize),
    )

    this.panInteraction = new DblClickDragZoom()
    this.$map.addInteraction(this.panInteraction)

    const mobileMapFlexibleContainer = this.$refs.mobileMapFlexibleContainer
    if (!mobileMapViewport) return

    function updateScroll() {
      const scrollTop = mobileMapViewport.scrollTop
      const viewportHeight = window.innerHeight

      let expectedHeight = scrollTop + SCROLL_THRESHOLD - headingHeight
      expectedHeight = Math.max(expectedHeight, 0)
      expectedHeight = Math.min(expectedHeight, viewportHeight - (SCROLL_THRESHOLD - headingHeight + 41))

      mobileMapFlexibleContainer.style.height = `${expectedHeight}px`
    }

    mobileMapViewport.addEventListener('scroll', updateScroll)
    this.$once('hook:beforeDestroy', () =>
      mobileMapViewport.removeEventListener('scroll', updateScroll),
    )

    this.$refs.mobileMapViewport.scrollTo({ top: 150 })
  },
  beforeDestroy() {
    this.$map.removeInteraction(this.panInteraction)
  },
  methods: {
    scrollTo(wanted) {
      let top = wanted
      if (top < 0) {
        const viewportHeight = window.innerHeight
        top = viewportHeight + top
      }
      this.$refs.mobileMapViewport.scrollTo({ top, behavior: 'smooth' })
    },

    scrollToPercent(percent = 1/3, threshold = 1/4) {
      const viewportHeight = window.innerHeight
      const currentScroll = this.$refs.mobileMapViewport.scrollTop

      // Scroll if the map is too small or too large
      if (currentScroll < viewportHeight * threshold || currentScroll / viewportHeight > 0.8) {
        const { height } = this.$refs.mobileMapPanel.getBoundingClientRect()
        const wanted = Math.min(height - bottomPadding, viewportHeight * percent - bottomPadding)
        this.scrollTo(wanted)
        return wanted
      }
    },

    toggleTool(tool) {
      const value = this.activeTool !== tool.name ? tool.name : null
      this.$store.commit('activeTool', value)
    },

    toggleTab(tab) {
      const value = tab.name
      this.$store.commit('activeTab', value)

      this.scrollToPercent(0.5, 0.15)

      if (tab.type === 'tool') {
        this.$store.commit('activeTool', value)
      } else {
        this.$store.commit('activeTool', null)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.main-content-overlay {
  height: 90%;
  height: calc(100% - 150px);
  width: 0;
  position: relative;
}

.search-tool {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  align-self: start;
  justify-self: start;
  margin-left: 4px;
}

.main-content-overlay-content {
  // pointer-events: auto;
  position: absolute;
  bottom: 100%;
}

.main-content-overlay-content--left {
  left: 0;
}

.main-content-overlay-content--right {
  right: 0;
}

.main-content {
  // pointer-events: none;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}
.main-panel {
  // pointer-events: auto;
  min-height: 90%;
  height: calc(100% - 150px);
  background: white;
  position: relative;
  z-index: 2;
  border-radius: 8px 8px 0 0;
}

@media (min-width: 501px) {
  .main-panel {
    width: 50%;
    margin-left: auto;
    margin-right: max(10px, env(safe-area-inset-right));
  }
}

.panel-content {
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.flexible-container {
  display: flex;
  flex-direction: column;
}

.app-toolbar,
:deep(.toolbar) {
  background: var(--popup-bg);
  padding: 5px;
}

.app-toolbar :deep(.btn) {
  padding: 10px 10px;
  margin: 0;
  border-radius: 5px;
}

.app-handle-wrapper {
  background: var(--popup-bg);
}
.app-handle {
  height: 5px;
  width: 40px;
  margin: 0 auto;
  margin-top: 10px;
  margin-bottom: 0;
  border-radius: 5px;
  background: currentColor;
}

.app-toolbar :deep(.btn.icon.styled.flat) {
  --icon-color: white;
  background: rgb(var(--color-primary-rgb), 0.6);
}

.status {
  position: absolute;
  z-index: 2;
  padding: 5px;
  border-radius: 50px;
  background: white;

  svg {
    display: block;
  }
}

:deep(.info-panel) {
  border-radius: 0;
  box-shadow: none;
  margin: 0 !important;
  width: 100%;
  border: 0;
}

:deep .ol-attribution {
  max-width: 50vw;
  white-space: nowrap;
  overflow: auto;
  flex-flow: row;
}
</style>
