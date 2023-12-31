import type { Meta, StoryObj } from '@storybook/vue3'

import SearchComponent from './Search.vue'
import { config } from '../routing/config'
import { MutationKey } from '../routing/store'
import { fake } from '../services'
import { setupProject } from '../storybook/setupProject'

import { preview } from '@/modules/storybook/previewDecorator'
import { store } from '@/store/typed'

export default {
  title: 'Modules/Search',
  component: SearchComponent,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    preview,
    () => ({
      template: '<story/>',
      setup() {
        setupProject()
        store.commit(MutationKey.init, { config })
      },
    }),
  ],
} as Meta

type Story = StoryObj<typeof SearchComponent>

export const Search: Story = {
  args: {
    providers: [{ providerKey: 'fake', provider: new fake() }],
  },
}
