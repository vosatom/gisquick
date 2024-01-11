import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import Spinner from '@/ui/Spinner.vue'

export default {
  title: 'UI Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(Spinner),
} as Meta

type Story = StoryObj<typeof Spinner>

export const Primary: Story = {}
