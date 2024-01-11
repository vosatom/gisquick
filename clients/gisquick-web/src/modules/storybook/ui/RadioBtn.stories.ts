import type { Meta, StoryObj } from '@storybook/vue3'

import RadioButton from '@/ui/RadioButton.vue'

export default {
  title: 'UI Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },
  render: (args) => ({
    components: { RadioButton },
    data() {
      return { value: args.value }
    },
    setup() {
      return { args }
    },
    template: `<div>
    <RadioButton val="loading" :value="value" @input="value = $event" label="Loading"/>
    <RadioButton val="success" :value="value" @input="value = $event" label="Success"/>
    <RadioButton val="error" :value="value" @input="value = $event" label="Error"/>
    <RadioButton val="" :value="value" @input="value = $event" label="None"/>
    </div>
`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof RadioButton>

export const Primary: Story = {
  args: {
    value: 'loading',
  },
}
