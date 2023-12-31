import type { Meta, StoryObj } from '@storybook/vue3'
import { feature } from '@turf/helpers'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import { mapState } from 'vuex'

import RoutingComponent from './Routing.vue'
import { config } from '../config'
import { MutationKey, QueryPointType, type RouteState } from '../store'
import { getFeatureConfig } from '../util/getFeatureConfig'

import * as loaders from '@/modules/services'
import { points } from '@/modules/storybook/mocks/points'
import Preview from '@/modules/storybook/Preview.vue'
import { setupProject } from '@/modules/storybook/setupProject'
import { store } from '@/store/typed'

export default {
  title: 'modules/Routing',
  component: RoutingComponent,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

type Story = StoryObj<typeof Preview>

const examplePoints = [
  feature(points[0], {
    id: '0',
    text: 'Zengrova',
    type: QueryPointType.Other,
    isInitialized: true,
    isTextAccurate: true,
    index: '',
  }),
  feature(points[1], {
    id: '1',
    text: 'Vilímovská',
    type: QueryPointType.Other,
    isInitialized: true,
    isTextAccurate: true,
    index: '',
  }),
  feature(points[2], {
    id: '2',
    text: 'Zikova',
    type: QueryPointType.Other,
    isInitialized: true,
    isTextAccurate: true,
    index: '',
  }),
] as RouteState['query']['points']['features']

interface Props {
  args: {
    routeProvider: loaders.fake
    enabled: boolean
  }
  store: typeof store
}

function prepareStory(callback?: (args: Props) => Props) {
  const key = 'route'
  let props: Props = {
    store,
    args: {
      routeProvider: new loaders.fake(),
      enabled: true,
    },
  }

  return {
    render: (_: unknown, { argTypes }) => ({
      components: { Preview, RoutingComponent },
      props: Object.keys(argTypes),
      computed: {
        ...mapState(['routing']),
      },
      setup() {
        setupProject()
        store.commit(MutationKey.init, { config })
        store.commit(MutationKey.setPoints, examplePoints.slice(0, 2))

        props = callback?.(props) ?? props
      },
      watch: {
        provider: function (provider: string) {
          let updatedConfig = cloneDeep(config)
          updatedConfig = set(
            updatedConfig,
            `features.${key}.provider`,
            provider,
          )
          store.commit(MutationKey.init, {
            config: updatedConfig,
          })
        },
      },

      template: `<Preview><RoutingComponent v-bind="$props"/></Preview>`,
    }),
    args: props.args,
  }
}

const featureConfig = getFeatureConfig(config, 'route')
const service = new loaders.fake()
const provider = config.providers[featureConfig.provider]

service.setGlobalParams(provider)
service.setFeatureParams('route', featureConfig.features)

export const Routing: Story = prepareStory((props) => {
  props.args.routeProvider.setFeatureParams('route', {
    alternatives: true,
    instructions: true,
  })
  return props
})

export const Routing__Empty: Story = prepareStory((props) => {
  props.store.commit(MutationKey.init, { config })
  props.store.commit(MutationKey.clearPoints)

  props.args.routeProvider.setFeatureParams('route', {
    alternatives: true,
    instructions: true,
  })
  return props
})

export const Routing__Error: Story = prepareStory((props) => {
  props.args.routeProvider.setError(new Error('Unfortunate accident happened'))
  return props
})

export const Routing__NoAlternatives: Story = prepareStory((props) => {
  props.args.routeProvider.setFeatureParams('route', {
    alternatives: false,
    instructions: true,
  })
  return props
})

export const Routing__NoInstructions: Story = prepareStory((props) => {
  props.args.routeProvider.setFeatureParams('route', {
    alternatives: true,
    instructions: false,
  })
  return props
})

export const Routing__Colored: Story = prepareStory((props) => {
  props.store.commit(MutationKey.setPoints, examplePoints)
  props.args.routeProvider.setFeatureParams(
    'route',
    {
      alternatives: true,
      instructions: true,
      colors: true,
    },
    ['colors'],
  )
  return props
})

export const Routing__Roundtrip: Story = prepareStory((props) => {
  props.store.commit(MutationKey.setPoints, examplePoints.slice(0, 1))
  props.args.routeProvider.setFeatureParams('route', {
    roundtrip: true,
  })
  return props
})
