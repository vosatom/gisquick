import type { Meta, StoryObj } from '@storybook/vue3'
import { feature } from '@turf/helpers'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import { fromLonLat } from 'ol/proj'
import { mapState } from 'vuex'

import IsolinesComponent from './Isolines.vue'
import RoutingComponent from './Routing.vue'
import { setupProject } from '../../storybook/setupProject'
import { setup } from '../../storybook-compat'
import { config } from '../config'
import { Mutation, QueryPointType, type RouteState } from '../store'
import { getFeatureConfig } from '../util/getFeatureConfig'

import * as loaders from '@/modules/services'
import Preview from '@/modules/storybook/Preview.vue'
import { store } from '@/store/typed'

export default {
  title: 'modules/services',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

type Story = StoryObj<typeof Preview>

setupProject()

setup(() => {
  store.commit(Mutation.init, { config })

  store.commit(Mutation.setPoints, [
    feature(
      {
        type: 'Point',
        coordinates: fromLonLat([14.383347807482387, 50.10892209142125]),
      },
      {
        id: '0',
        text: 'Zengrova',
        type: QueryPointType.Start,
        isInitialized: true,
        isTextAccurate: true,
        index: '',
      },
    ),
    feature(
      {
        type: 'Point',
        coordinates: fromLonLat([14.371570168730052, 50.10143985922096]),
      },
      {
        id: '1',
        text: 'Vilímovská',
        type: QueryPointType.End,
        isInitialized: true,
        isTextAccurate: true,
        index: '',
      },
    ),
  ] as RouteState['query']['points']['features'])
})

function prepareStory(key: string, components: any, template: string) {
  return {
    render: (_: unknown, { argTypes }) => ({
      components,
      props: Object.keys(argTypes),
      computed: {
        ...mapState(['routing']),
      },
      watch: {
        provider: function (provider: string) {
          let updatedConfig = cloneDeep(config)
          updatedConfig = set(
            updatedConfig,
            `features.${key}.provider`,
            provider,
          )
          store.commit(Mutation.init, {
            config: updatedConfig,
          })
        },
      },
      template,
    }),
    args: {
      provider: 'graphhopper',
      isEnabled: true,
    },
    argTypes: {
      provider: {
        options: Object.entries(loaders)
          .filter(([, val]) => typeof val.prototype[key] !== 'undefined')
          .map(([key]) => key),
        control: { type: 'radio' },
      },
    },
  }
}

const featureConfig = getFeatureConfig(config, 'route')
const service = new loaders.fake()
const provider = config.providers[featureConfig.provider]

service.setGlobalParams(provider)
service.setFeatureParams('route', featureConfig.features)

export const Routing: Story = {
  render: (args, { argTypes }) => ({
    components: { Preview, RoutingComponent },
    props: { service },
    template: `<Preview><RoutingComponent :routeProvider="service"/></Preview>`,
  }),
  args: {
    service,
  },
}

export const Routing__Error: Story = prepareStory(
  'route',
  { Preview, RoutingComponent },
  `<Preview :provider="$props.provider"><RoutingComponent v-bind="$props"/></Preview>`,
)

export const Routing__NoAlternatives: Story = prepareStory(
  'route',
  { Preview, RoutingComponent },
  `<Preview :provider="$props.provider"><RoutingComponent v-bind="$props"/></Preview>`,
)

export const Routing__NoInstructions: Story = prepareStory(
  'route',
  { Preview, RoutingComponent },
  `<Preview :provider="$props.provider"><RoutingComponent v-bind="$props"/></Preview>`,
)

export const Isolines: Story = prepareStory(
  'isoline',
  { Preview, IsolinesComponent },
  `<Preview :provider="$props.provider"><IsolinesComponent v-bind="$props"/></Preview>`,
)
