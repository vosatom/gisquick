import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { type Meta } from '@storybook/vue3'
import { createBrowserHistory } from 'history'
import { provide } from 'vue'

import appData from '../mocks/app.json'
import project from '../mocks/project-mnk.json'

import MobileMap from '@/components/MobileMap.vue'
import MNKMobileMap from '@/modules/mnk/MobileMap.vue'
import { config } from '@/modules/routing/config'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import Swiper from '@/swiper'

export default {
  title: 'App',
  component: MobileMap,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphone6',
    },
  },
  render: (args, { parameters }) => ({
    components: { MobileMap: parameters.component },
    props: ['language'],
    setup() {
      provide('history', createBrowserHistory())

      setup((app) => {
        store.commit('routing/init', { config })
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', project)

        app.use(Swiper)
      })

      return { args }
    },
    watch: {
      language(language) {
        this.$language.current = language
      },
    },
    template: `<div class="f-col" style="width:100vw;height:100vh;"><MobileMap v-bind="args"/></div>`,
  }),
} as Meta

export const Mobile = {
  parameters: {
    component: MobileMap,
  },
}
export const MobileMNK = {
  parameters: {
    component: MNKMobileMap,
  },
}
