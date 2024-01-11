import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import Checkbox from '@/ui/Checkbox.vue'

export default {
  title: 'UI Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(Checkbox),
} as Meta

type Story = StoryObj<typeof Checkbox>

export const Primary: Story = {}
