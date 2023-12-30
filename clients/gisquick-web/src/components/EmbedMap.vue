<template>
  <div class="map-container" :class="{'no-controls': !showControls}">
    <CurrentCursor />
    <div ref="mapEl" class="map"/>
    <div class="sticky-bottom">
      <scale-line/>
      <map-attributions class="map-attributions"/>
    </div>
    <transition name="fade">
      <div v-if="isLoading" class="status f-row-ac m-2">
        <v-spinner width="2" size="18"/>
        <translate class="mx-2">Loading</translate>
      </div>
    </transition>

    <div class="right-container f-col">
      <portal-target
        name="right-panel"
        class="right-panel"
      />
      <div class="f-grow"/>
    </div>
    <map-control v-if="showControls"/>

    <div ref="mapViewport" class="visible-container"/>
    
    <MapTools ref="tools" show-header hidden-identification/>
    <div style="display: none;">
      <MNKContent />
    </div>

    <div class="bottom-container">
      <portal-target name="bottom-panel"/>
    </div>
  </div>
</template>

<script lang="js">
import { mapState } from 'vuex'

import Map from '@/mixins/Map'
import MapAttributions from '@/components/MapAttributions.vue'
import ContentPanel from '@/components/content-panel/ContentPanel.vue'
import MapControl from '@/components/MapControl.vue'
import ScaleLine from '@/components/ol/ScaleLine.vue'
import CurrentCursor from '@/components/CurrentCursor.vue'
import MapTools from './MapTools.vue'
import MNKContent from '@/modules/mnk/MNKContent.vue'

export default {
  name: 'Map',
  mixins: [Map],
  components: {
    ScaleLine, MapAttributions, MapControl, CurrentCursor, MapTools, ContentPanel,
    MNKContent
},
  refs: ['tools'],
  data () {
    return {
      panelVisible: true,
      statusBarVisible: true
    }
  },
  mounted() {
    const map = this.$map
    const originalVisibleAreaPadding = map.ext.visibleAreaPadding

    Object.assign(map.ext, {
      visibleAreaPadding: () => {
        let padding = originalVisibleAreaPadding()
        padding = padding.map(v => Math.max(40, v))
        return padding
      },
    })
  },
  computed: {
    ...mapState(['user', 'routing']),
    toolsMenuItems () {
      const tools = (this.$refs.tools && this.$refs.tools.items) || []
      return tools.filter(t => !t.disabled)
    },
    showControls() {
      return this.queryParams.controls !== 'false'
    },
  },
  created () {
    this.$root.$panel = {
      setStatusBarVisible: (visible) => {
        this.statusBarVisible = visible
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse-width-enter-active, .collapse-width-leave-active {
  transition: all .5s;
}
.collapse-width-enter, .collapse-width-leave-to {
  width: 0!important;
}
.visible-container {
  flex-grow: 1;
  pointer-events: none;
  position: relative;
  > * {
    pointer-events: auto;
  }
}
.map-overlay {
  pointer-events: none;
}

.main-panel {
  overflow: hidden;
  > div {
    align-self: flex-end;
    width: 288px;
    flex: 1 1;
    overflow: hidden;
    // > .collapsible {
    //   flex-shrink: 0;
    // }
  }
  .content-panel {
    flex: 1 1;
    overflow: hidden;
  }
}

.map-container {
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr minmax(0, max-content) minmax(0, min-content) minmax(0, min-content);
  > * {
    position: relative;
  }

  .map {
    grid-column: 1 / 4;
    grid-row: 1 / 5;
    z-index: 0;
    min-width: 0;
    min-height: 0;
  }
  .right-container {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    justify-content: flex-end;
    align-items: flex-end;
    // justify-items: center;
    min-height: 0;
    max-height: 100%;
    margin: 6px 44px 0 0;
    pointer-events: none;
    > * {
      pointer-events: auto;
    }
    .map-control {
      flex: 0 0;
    }
  }
  .sticky-bottom {
    grid-column: 2 / 4;
    grid-row: 3 / 4;
    position: relative;
    overflow: visible;
    > * {
      position: absolute;
      bottom: 2px;
    }
    .scale-line {
      left: 0;
    }
    .map-attributions {
      right: 2px;
      left: 10em;
    }
  }
  .map-attributions {
    z-index: 1;
  }
  .main-panel {
    grid-column: 1 / 2;
    grid-row: 1 / 5;
    z-index: 2;
  }
  .top-toolbar {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    align-self: start;
    justify-self: start;
    z-index: 2;
  }
  .panel-toggle {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    align-self: center;
    z-index: 1;
  }
  .map-control {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    margin: 0.25em;
    z-index: 2;

    align-self: end;
    justify-self: end;
  }
  .app-menu {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    align-self: start;
    justify-self: end;
  }
  .right-panel {
    // grid-column: 3 / 4;
    // grid-row: 1 / 2;
    z-index: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    justify-content: flex-end;
  }
  .visible-container {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
  }
  .map-overlay {
    grid-column: 2 / 4;
    grid-row: 1 / 2;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
  }
  .status-bar {
    grid-column: 1 / 4;
    grid-row: 4 / 5;
    z-index: 1;
    align-self: end;
  }
  .bottom-container {
    grid-column: 2 / 4;
    grid-row: 2 / 5;
    z-index: 2;
    min-width: 0;
    max-width: 100%;
  }
  .status {
    grid-column: 1 / 4;
    grid-row: 1 / 2;
    align-self: start;
    justify-self: center;
    z-index: 1;
    min-width: 0;
    max-width: 100%;
    background-color: rgba(var(--color-dark-rgb), 0.85);
    color: #fff;
    border-radius: 4px;
    padding: 2px 4px;
  }
  .auth-status {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    align-self: start;
    justify-self: end;
    z-index: 1;
    top: 8px;
    right: 48px;
    .guest {
      margin: 2px;
    }
    .signed {
      .icon {
        background-color: #fff;
        border-radius: 50%;
      }
    }
  }
}

.map {
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.main-panel {
  position: relative;
  width: 288px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #aaa;
  box-shadow:
    0 6px 6px -3px rgba(0,0,0,.2),
    0 10px 14px 1px rgba(0,0,0,.14),
    0 4px 18px 3px rgba(0,0,0,.12);
}

.btn.panel-toggle {
  margin: 0;
  width: 20px;
  height: 36px;

  min-width: 0;
  padding: 0;
  border-radius: 0;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  &.expanded .icon {
    transform: rotateY(180deg);
  }
}

.bottom-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  pointer-events: none;
  .collapse-enter-active, .collapse-leave-active {
    overflow: visible!important;
  }
  /*.collapse-enter, .collapse-leave-to {
    opacity: 0!important;
  }*/
}

.app-menu {
  .btn {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    opacity: 0.95;
  }
}

.no-controls .map-attributions :deep(.ol-attribution) {
  right: 2px;
}
</style>
