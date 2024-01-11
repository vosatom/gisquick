import { type Meta } from '@storybook/vue3'
import Map from '@/components/MNKMap.vue'

import { store } from '@/store/typed'

import appData from '../mocks/app.json'
import project from '../mocks/project-mnk.json'

import Map from '@/modules/mnk/MNKMap.vue'
import { config } from '@/modules/routing/config'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import Swiper from '@/swiper'

export default {
  title: 'Mobile Components/MNK Map',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { Map },
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
    template: `<div class="f-col" style="width:100vw;height:100vh;"><Map v-bind="args"/></div>`,
  }),
} as Meta

export const Primary = {}
