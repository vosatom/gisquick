import { type Meta } from '@storybook/vue3'
import { createBrowserHistory } from 'history'
import { provide } from 'vue'

import { languageControl } from '../constants'
import appData from '../mocks/app.json'
import project from '../mocks/project-mnk.json'

import DesktopMap from '@/components/Map.vue'
import MNKDesktopMap from '@/modules/mnk/MNKMap.vue'
import { config } from '@/modules/routing/config'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import Swiper from '@/swiper'

export default {
  title: 'App',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    language: languageControl,
  },
  render: (args, { parameters }) => ({
    components: { Map: parameters.component },
    props: ['language'],
    setup(props) {
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
    template: `<div class="f-col" style="width:100vw;height:100vh;"><Map v-bind="args"/></div>`,
  }),
} as Meta

export const Desktop = {
  parameters: {
    component: DesktopMap,
  },
}
export const DesktopMNK = {
  parameters: {
    component: MNKDesktopMap,
  },
}
