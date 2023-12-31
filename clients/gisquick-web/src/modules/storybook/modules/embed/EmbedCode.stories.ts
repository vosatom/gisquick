import type { StoryObj, Meta } from '@storybook/vue3'

import EmbedCode from '@/modules/embed/EmbedCode.vue'
import Preview from '@/modules/storybook/Preview.vue'

export default {
  title: 'UI Components/EmbedCode',
  component: EmbedCode,
  parameters: {
    layout: 'centered',
  },
  argTypes: { onClick: {} },
  args: {
    default: 'Content',
  },
  render: (args) => ({
    components: { Preview, EmbedCode },
    setup() {
      return { args }
    },
    template: `<Preview><EmbedCode v-bind="args">{{args.default}}</EmbedCode></Provider>`,
  }),
} as Meta

type Story = StoryObj<typeof EmbedCode>

export const Primary: Story = {}
