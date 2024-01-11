import type { Meta, StoryObj } from '@storybook/vue3'

import Dialog from '@/ui/Dialog.vue'

export default {
  title: 'UI Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  render: args => ({
    components: { Dialog },
    data() {
      return { value: args.value }
    },
    setup() {
      return { args }
    },
    methods: {
      closeDialog() {
        this.value = false
      },
      openDialog() {
        this.value = true
      },
    },
    template: `<div><Dialog v-bind="args" :value="value" @input="value = $event">
  <div class="f-col">
  <h2 class="title p-2">Title</h2>
  <div class="content p-2">Message</span>

  <div class="f-row-ac">
    <v-checkbox label="Do not show again" />
    <span class="f-grow"/>
    <v-btn
      color="primary"
      class="small"
      @click="closeDialog"
    >
      Close
    </v-btn>
  </div>
</div>
  </Dialog>    <v-btn
  color="primary"
  class="small"
  @click="openDialog"
>
  Open modal
</v-btn></div>`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof Dialog>

export const Primary: Story = {
  args: {
    title: 'Notifications',
  },
}
