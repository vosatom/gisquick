import { Meta } from '@storybook/vue3'

import Preview from './Preview.vue'
import appData from '../../mocks/app.json'
import project from '../../mocks/project-mnk.json'

import IdentificationComponent from '@/components/Identification.vue'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'
import { transformProject } from '@/transformProject'

export default {
  title: 'Tools/Identification',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { Preview, IdentificationComponent },
    setup() {
      setup(() => {
        const _project = transformProject(JSON.parse(JSON.stringify(project)))
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', _project)

        store.commit('activeTool', 'distance')
      })

      return { args }
    },
    template: `<Preview><IdentificationComponent v-bind="args"/></Preview>`,
  }),
} as Meta

export const Identification = {
  args: {
    displayMode: 'both',
  },
}
