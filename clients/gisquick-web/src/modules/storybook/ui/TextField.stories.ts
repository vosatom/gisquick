import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import TextField from '@/ui/TextField.vue'

export default {
  title: 'UI Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(TextField),
} as Meta

type Story = StoryObj<typeof TextField>

export const Primary: Story = {
  args: {
    placeholder: 'Place',
  },
}
