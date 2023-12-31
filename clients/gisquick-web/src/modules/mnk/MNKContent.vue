<template>
  <div class="content-panel light">
    <div class="content-header f-col-ac f-justify-center">
      <img src="@/assets/mnk/logo.svg?url" class="logo" @click="zoomToMax" />
    </div>

    <v-tabs-header
      :items="tabsHeaderItems"
      :value="activeTab"
      @input="store.commit('activeTab', $event)"
      v-if="tabsHeaderItems.length > 1"
    />
    <v-tabs
      class="f-grow"
      :items="tabsHeaderItems"
      :value="activeTab"
      @input="store.commit('activeTab', $event)"
    >
      <template v-slot:[activeTab]="{ visible }">
        <component
          v-if="activeTabItem"
          :is="activeTabItem.component"
          :isVisible="visible"
          v-bind="activeTabItem.props"
        />
      </template>
    </v-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import ContentPanel from '@/components/content-panel/ContentPanel.vue'
import { useOlMap } from '@/composables/useOlMap'
import ProjectInfoPanel from '@/modules/ProjectInfo/Sidebar.vue'
import { useInfoPanelItems } from '@/modules/ProjectInfo/useInfoPanelItems'
import RoutingPanel from '@/modules/routing/components/Sidebar.vue'
import { useGettext } from '@/modules/vue-gettext'
import { useStore } from '@/store/typed'
import VTabs from '@/ui/Tabs.vue'
import VTabsHeader from '@/ui/TabsHeader.vue'

const { $gettext } = useGettext()

const store = useStore()

const map = useOlMap()

const infoPanelItems = useInfoPanelItems()

const routing = computed(() => store.state.routing)

const tabsItems = computed(() => {
  return [
    {
      key: 'info',
      icon: 'legend',
      label: $gettext('Info'),
      show: infoPanelItems.value.length,
      component: ProjectInfoPanel,
      props: { infoPanelItems: infoPanelItems.value },
    },
    {
      key: 'layers',
      icon: 'base-layer',
      label: $gettext('Layers'),
      show: true,
      component: ContentPanel,
    },
    {
      key: 'routing',
      icon: 'path',
      label: $gettext('Routing'),
      show: routing.value.config?.features?.route?.enabled,
      component: RoutingPanel,
    },
  ]
})

const tabsHeaderItems = computed(() => tabsItems.value.filter((i) => i.show))

const activeTabItem = computed(() => {
  const activeTabKey = store.state.activeTab
  const activeTabItem = tabsHeaderItems.value.find(
    (tab) => tab.key === activeTabKey,
  )
  return activeTabItem ?? tabsHeaderItems.value[0]
})
const activeTab = computed(() => {
  return activeTabItem.value?.key
})

function zoomToMax() {
  const extent = store.state.project.config.zoom_extent
  const padding = map.ext.visibleAreaPadding()
  map.getView().fit(extent, { duration: 400, padding })
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

.content-header {
  padding: 15px 10px;

  svg {
    max-width: 200px;
  }
}

.logo {
  max-width: 250px;
  margin: 10px 0;
  cursor: pointer;
}
</style>
