import type { Meta, StoryObj } from '@storybook/vue3'

import IsolinesComponent from './Isolines.vue'

import * as loaders from '@/modules/services'
import { preview } from '@/modules/storybook/previewDecorator'

export default {
  title: 'modules/Routing/Isolines',
  component: IsolinesComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [preview],
} as Meta

type Story = StoryObj

export const Isolines: Story = {
  args: {
    isEnabled: true,
    provider: new loaders.fake(),
  },
}
