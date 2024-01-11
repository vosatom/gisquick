import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import Slider from '@/ui/Slider.vue'

export default {
  title: 'UI Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 10,
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(Slider),
} as Meta

type Story = StoryObj<typeof Slider>

export const Primary: Story = {
  args: {
    min: 0,
    max: 100,
  },
}
