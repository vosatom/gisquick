import type { Meta, StoryObj } from '@storybook/vue3'

import Menu from '@/ui/Menu.vue'

export default {
  title: 'UI Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  render: args => ({
    components: { Menu },
    data() {
      return { value: args.value }
    },
    setup() {
      return { args }
    },
    template: `<Menu v-bind="args">
    <template v-slot:activator="{ toggle }">
      <v-btn
        class="icon round p-1"
        @click="toggle"
      >
        <v-icon name="account" size="24"/>
      </v-btn>
    </template></Menu>`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof Menu>

export const Primary: Story = {
  args: {
    align: 'rr;bb,tt',
    items: [
      {
        key: 'profile',
        text: 'My profile',
        icon: 'settings',
        link: '/user/',
      },
      {
        key: 'logout',
        text: 'Logout',
        icon: 'logout',
      },
    ],
  },
}
// <v-menu
// align="rr;bb,tt"
// :items="mainMenu"
// >
// <template v-slot:activator="{ toggle }">
//   <v-btn
//     :aria-label="tr.Menu"
//     class="icon round p-1"
//     @click="toggle"
//   >
//     <v-icon name="account" size="24"/>
//   </v-btn>
// </template>
// </v-menu>
