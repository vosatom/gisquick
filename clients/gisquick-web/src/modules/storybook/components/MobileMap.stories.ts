import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { type Meta } from '@storybook/vue3'


import appData from '../mocks/app.json'
import project from '../mocks/project-mnk.json'

import MobileMap from '@/modules/mnk/MobileMap.vue'
import { config } from '@/modules/services/config'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import Swiper from '@/swiper'

export default {
  title: 'Mobile Components/Map',
  component: MobileMap,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphone6',
    },
  },
  render: (args) => ({
    components: { MobileMap },
    setup() {
      setup((app) => {
        store.commit('routing/init', { config })
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', project)

        app.use(Swiper)
      })

      return { args }
    },
    template: `<div class="f-col" style="width:100vw;height:100vh;"><MobileMap v-bind="args"/></div>`,
  }),
} as Meta

export const Primary = {}
