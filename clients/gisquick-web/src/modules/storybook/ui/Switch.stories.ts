import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import Switch from '@/ui/Switch.vue'

export default {
  title: 'UI Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(Switch),
} as Meta

type Story = StoryObj<typeof Switch>

export const Primary: Story = {}
