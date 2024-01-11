import type { StoryObj } from '@storybook/vue'

import { createComponentStoryMeta } from '../createComponentStoryMeta'

import Button from '@/ui/Button.vue'

const COLORS = ['primary', 'green', 'red', 'orange', 'yellow', 'grey', 'dark']

const colorTemplate = (args) => ({
  components: { [Button.name]: Button },
  setup() {
    return { args }
  },
  template: `<div class="f-row">${COLORS.map(
    (color) =>
      `<v-btn color="${color}" v-bind="args">${args.default.replace(
        '@color',
        color,
      )}</v-btn>`,
  ).join('')}</div>`,
})

export default {
  title: 'UI Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: { click: {} },
  args: {
    default: 'Content',
  },
  ...createComponentStoryMeta(Button),
}

type Story = StoryObj<typeof Button>

export const Primary: StoryObj = () => ({
  args: { color: 'primary' },
})

export const Colored: StoryObj = {
  render: colorTemplate,
  args: {
    default: '@color',
  },
}

export const WithIcon: Story = {
  render: colorTemplate,
  args: {
    default: '<v-icon name="edit-geometry"/> @color',
  },
}

export const OnlyIcon: Story = {
  render: colorTemplate,
  args: {
    icon: true,
    default: '<v-icon name="edit-geometry"/>',
  },
}

export const Disabled: Story = {
  render: colorTemplate,
  args: {
    disabled: true,
    default: '@color',
  },
}

export const Active: Story = {
  args: {
    active: true,
  },
}

export const Loading: Story = {
  render: colorTemplate,
  args: {
    loading: true,
  },
}

export const Outlined: StoryObj = {
  render: colorTemplate,
  args: {
    outlined: true,
    default: '@color',
  },
}
