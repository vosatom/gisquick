import { Meta } from '@storybook/vue3'

import Preview from './Preview.vue'
import appData from '../../mocks/app.json'
import project from '../../mocks/project.json'

import MeasureComponent from '@/components/measure/Measure.vue'
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
  title: 'Modules/Measure',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
  render: args => ({
    components: { Preview, MeasureComponent },
    setup() {
      return { args }
    },
    template: `<Preview><MeasureComponent v-bind="args"/><div style="width:300px"><portal-target name="main-panel"/></div></Preview>`,
  }),
} as Meta

export const Location = {
  args: {
    type: 'location'
  }
}

export const Distance = {
  args: {
    type: 'distance'
  }
}

export const Area = {
  args: {
    type: 'area'
  }
}
