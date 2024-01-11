import type { Meta, StoryObj } from '@storybook/vue3'

import Icon from '@/ui/Icon.vue'
import './Icon.css'

const allIconsModules = import.meta.glob('@/icons/*.svg', { eager: true })
const allIcons = Object.values(allIconsModules).map((m) => m.default)

export default {
  title: 'UI Components/Icon',
  component: Icon,
} as Meta

type Story = StoryObj<typeof Icon>

export const AllIcons: Story = {
  render: (args) => ({
    components: { Icon },
    setup() {
      return { args, allIcons }
    },
    methods: {
      async copyURL(text) {
        try {
          await navigator.clipboard.writeText(text)
        } catch (err) {
          // Ignore error
        }
      },
    },
    template: `
    <div class="icon-list">
      <div v-for="icon in allIcons" class="icon-container" @click="() => copyURL(icon)">
      <Icon :name="icon"/>
      <span class="icon-name">{{icon}}</span>
      </div>
    </div>`,
  }),
}
