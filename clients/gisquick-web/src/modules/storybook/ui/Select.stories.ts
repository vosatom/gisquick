import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import Select from '@/ui/Select.vue'

export default {
  title: 'UI Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(Select),
} as Meta

type Story = StoryObj<typeof Select>

export const Primary: Story = {
  args: {
    items: [5, 10, 20, 50],
    class: 'inline filled',
  },
}
