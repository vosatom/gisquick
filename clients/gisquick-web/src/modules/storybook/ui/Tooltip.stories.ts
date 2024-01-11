import type { Meta, StoryObj } from '@storybook/vue3'

import Tooltip from '@/ui/Tooltip.vue'

export default {
  title: 'UI Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  render: args => ({
    components: { Tooltip },
    data() {
      return { value: args.value }
    },
    setup() {
      return { args }
    },
    template: `
    <v-btn
      class="icon flat ml-auto mr-0"
    >
      <Tooltip slot="tooltip" :hoverDelay="100">
        <translate>Filter by attribute value</translate>
      </Tooltip>
      <v-icon name="filter" size="13"/>
    </v-btn>`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof Tooltip>

export const Primary: Story = {}
