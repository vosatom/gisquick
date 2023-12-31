import { computed } from 'vue'

import Description from './Description.vue'
import { getFeatureConfig } from '../routing/util/getFeatureConfig'

import Bookmarks from '@/modules/bookmarks/Bookmarks.vue'
import SearchPanel from '@/modules/search/Sidebar.vue'
import { useStore } from '@/store/typed'

const store = useStore()

export function useInfoPanelItems() {
  return computed(() => {
    return [
      getFeatureConfig(store.state.routing.config, 'search')?.enabled && {
        key: 'search',
        component: SearchPanel,
      },
      store.state.project.config.description && {
        key: 'description',
        component: Description,
        props: {
          content: store.state.project.config.description,
        },
      },
      store.state.project.config.bookmarks &&
        Object.keys(store.state.project.config.bookmarks).length && {
          key: 'bookmarks',
          component: Bookmarks,
        },
    ].filter((i) => i)
  })
}
