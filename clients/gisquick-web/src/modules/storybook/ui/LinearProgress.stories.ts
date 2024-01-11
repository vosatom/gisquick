import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMeta } from '../createComponentStoryMeta'

import LinearProgress from '@/ui/LinearProgress.vue'

export default {
  title: 'UI Components/LinearProgress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMeta(LinearProgress),
} as Meta

type Story = StoryObj<typeof LinearProgress>

export const Primary: Story = {
  args: {
    value: 10,
  },
}
