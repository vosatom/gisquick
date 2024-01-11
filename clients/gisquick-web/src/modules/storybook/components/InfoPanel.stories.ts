import { type StoryObj, type Meta } from '@storybook/vue3'
import { Feature } from 'ol'
import { Point } from 'ol/geom'


import appData from '../mocks/app.json'
import project from '../mocks/project.json'

import InfoPanel from '@/components/InfoPanel.vue'
import { formatFeatures } from '@/formatters'
import { setup } from '@/modules/storybook-compat'
import { store } from '@/store/typed'

setup(() => {
  store.commit('app', appData.app)
  store.commit('user', appData.user)
  store.commit('project', project)
})

export default {
  title: 'Components/InfoPanel',
  component: InfoPanel,
  parameters: {
    layout: 'centered',
  },
  argTypes: { onClose: {}, onDelete: {} },
  render: args => ({
    components: { InfoPanel },
    store,
    setup() {
      return { args }
    },
    data() {
      return {
        selected: args.selected,
        editMode: args.editMode,
      }
    },
    methods: {
      selectionChange(newValue) {
        this.selected = newValue
      },
    },
    template: `<div><popup-layer name="infopanel-tool"/><InfoPanel v-bind="{...args, selected}" v-model:editMode="editMode" class="edit-form" @selection-change="selectionChange"></InfoPanel></div>`,
  }),
} as Meta

type Story = StoryObj<typeof InfoPanel>

const data = [
  {
    adm0_a3: 'CZE',
    gdp_md_est: 265200,
    name: 'Czech Rep.',
    pop_est: 10211904,
    subregion: 'Eastern Europe',
  },
  {
    adm0_a3: 'CZE',
    gdp_md_est: 265200,
    name: 'Czech Rep.',
    pop_est: 10211904,
    subregion: 'Eastern Europe',
  },
]

const layer = project.layers[1].layers[1]
const editableLayer = project.layers[1].layers[0]

const features = data.map((attrs, index) => {
  const feature = new Feature(new Point([0, 0]))
  feature.setId(index)
  Object.entries(attrs).forEach(([key, value]) => {
    feature.set(key, value)
  })
  return feature
})

formatFeatures({ config: project }, layer, features)

export const Standard: Story = {
  args: {
    toolbarTarget: 'infopanel-tool',
    features,
    layer,
    layers: [layer],
    project,

    selected: {
      layer: layer.name,
      featureIndex: 0,
    },
  },
}

export const Editable: Story = {
  args: {
    toolbarTarget: 'infopanel-tool',
    features,
    layer: editableLayer,
    layers: [editableLayer],
    project,

    selected: {
      layer: editableLayer.name,
      featureIndex: 0,
    },
  },
}
