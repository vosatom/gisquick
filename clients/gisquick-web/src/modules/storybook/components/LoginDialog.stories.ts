import { type Meta } from '@storybook/vue3'

import LoginDialog from '@/components/LoginDialog.vue'

export default {
  title: 'Screens/Login Dialog',
  component: LoginDialog,
  parameters: {
    layout: 'fullscreen',
  },
  render: args => ({
    components: { LoginDialog },
    setup() {
      return { args }
    },
    template: `<div><LoginDialog v-bind="args" :value="true"/></div>`,
  }),
} as Meta

export const Primary = {}
