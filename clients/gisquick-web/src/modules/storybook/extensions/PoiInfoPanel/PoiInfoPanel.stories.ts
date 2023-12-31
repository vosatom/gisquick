import { type StoryObj, type Meta } from '@storybook/vue'
import { Feature } from 'ol'
import { Point } from 'ol/geom'

import appData from '../../mocks/app.json'
import { points } from '../../mocks/points'
import project from '../../mocks/project-mnk.json'
import { preview } from '../../previewDecorator'

import InfoPanel from '@/extensions/PoiInfoPanel/PoiInfoPanel.vue'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'

export default {
  title: 'Extensions/PoiInfoPanel',
  component: InfoPanel,
  parameters: {
    layout: 'centered',
  },
  argTypes: { onClose: {}, onDelete: {} },
  decorators: [preview],
  render: (args) => ({
    components: { InfoPanel },
    store,
    setup() {
      setup(() => {
        store.commit('app', appData.app)
        store.commit('user', appData.user)
        store.commit('project', project)
      })

      return { args }
    },
    template: `<div><popup-layer name="infopanel-tool"/><InfoPanel v-bind="args"/></div>`,
  }),
} as Meta

type Story = StoryObj<typeof InfoPanel>

const layer = project.layers[1].layers[1]

const feature = new Feature(new Point(points[1].coordinates))
feature.setId(0)
Object.entries({
  desc: 'Václavské náměstí je nejznámější náměstí v Praze.',
  id: 1,
  last_modification: '2024-01-01T01:23:45.600Z',
  marker_id: 104,
  name: 'Václavské náměstí',
  url: 'https://example.com',
}).forEach(([key, value]) => {
  feature.set(key, value)
})

export const PoiInfoPanel: Story = {
  args: {
    feature,
    relationsData: {},
    layer,
    project,
  },
}
