import { Meta } from '@storybook/vue3'

import appData from '../mocks/app.json'
import project from '../mocks/project.json'

import PrintComponent from '@/components/print/Print.vue'
import Preview from '@/modules/storybook/Preview.vue'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'

setup(() => {
  store.commit('app', appData.app)
  store.commit('user', appData.user)
  store.commit('project', project)

  store.commit('activeTool', 'distance')
})

export default {
  title: 'Tools/Print',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { Preview, PrintComponent },
    setup() {
      return { args }
    },
    template: `<Preview><PrintComponent v-bind="args"/><div style="width:300px"><portal-target name="main-panel"/></div></Preview>`,
  }),
} as Meta

export const Location = {
  args: {
    measure: {},
  },
}
