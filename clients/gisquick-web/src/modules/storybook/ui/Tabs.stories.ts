import type { Meta, StoryObj } from '@storybook/vue3'

import Tabs from '@/ui/Tabs.vue'
import TabsHeader from '@/ui/TabsHeader.vue'
import TextTabsHeader from '@/ui/TextTabsHeader.vue'

export default {
  title: 'UI Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  render: ({ TabsHeader }) => ({
    components: { Tabs, TabsHeader },
    data() {
      return { activeMainTab: 'base' }
    },
    setup() {
      const tabsItems = [
        { key: 'base', icon: 'base-layer', label: 'Base Layers' },
        { key: 'overlay', icon: 'overlays', label: 'Overlay Layers' },
        { key: 'other', icon: 'topics', label: 'Other Layers' },
      ]

      return { tabsItems }
    },
    template: `
    <div>
    <TabsHeader :items="tabsItems" v-model="activeMainTab"/>
    <Tabs class="f-grow" :items="tabsItems" v-model="activeMainTab">
      <template v-for="tab in tabsItems" #[tab.key] :key="tab.key">
        <scroll-area>
          <div class="p-4">
          {{tab.key}}
          </div>
        </scroll-area>
      </template>
      </Tabs>
      </div>
    `,
  }),

  args: {
    label: 'Label',
  },
} as Meta

export const Primary: Story = {
  args: {
    TabsHeader,
  },
}
export const TextTabs: Story = {
  args: {
    TabsHeader: TextTabsHeader,
  },
}
