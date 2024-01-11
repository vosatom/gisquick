import type { Meta, StoryObj } from '@storybook/vue3'

import { createComponentStoryMetaWithValue } from '../createComponentStoryMeta'

import DateField from '@/ui/DateField.vue'

export default {
  title: 'UI Components/DateField',
  component: DateField,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Label',
  },
  ...createComponentStoryMetaWithValue(DateField),
} as Meta

type Story = StoryObj<typeof DateField>

export const Primary: Story = {}
