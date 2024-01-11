import type { Meta, StoryObj } from '@storybook/vue3'

import TreeView from '@/ui/TreeView.vue'

export default {
  title: 'UI Components/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
  },
  render: args => ({
    components: { TreeView },
    data() {
      return {
        expandedGroups: args.expanded,
        expandedLayer: null,
        value: [],
      }
    },
    methods: {
      toggleGroup(group) {
        this.expandedGroups[group.name] = !this.expandedGroups[group.name]
      },
      toggleLayerInfo(layer) {
        this.expandedLayer = this.expandedLayer !== layer ? layer : null
      },
    },
    setup() {
      return { args }
    },
    template: `<div style="width:400px;">
    <TreeView
    class="layers-tree"
    item-key="name"
    item-children="layers"
    v-bind="args"
    :expanded="expandedGroups"
  >
    <template v-slot:group="{ group, depth }">
      <div class="item group f-row-ac" :depth="depth" @click="toggleGroup(group)">
        <span class="label f-grow" v-text="group.name"/>
      </div>
    </template>
    <template v-slot:leaf="{ item }">
      <div class="item layer f-row-ac" :class="{expanded: expandedLayer === item}">
        <v-checkbox
          class="f-grow"
          :label="item.title || item.name"
          :value="args.value === item.name"
          @input="$emit('input', args.value === item.name ? null : item.name)"
        />
        <v-btn class="icon flat small" @click="toggleLayerInfo(item)">
          <v-icon
            class="toggle"
            name="arrow-down"
            size="12"
          />
        </v-btn>
      </div>
      <collapse-transition>
        <div v-if="expandedLayer === item" class="metadata px-2 py-1">
          <strong>
            Description
          </strong>
          <div v-text="item.description"/>
        </div>
      </collapse-transition>
    </template>
  </TreeView>
  </div>`,
  }),
} as Meta

type Story = StoryObj<typeof TreeView>

export const Primary: Story = {
  args: {
    items: [
      {
        layers: [
          {
            name: 'First layer',
            description: 'Description of the first layer',
          },
        ],
        mutually_exclusive: true,
        name: 'First group',
      },
      {
        layers: [
          {
            name: 'First layer',
            description: 'Description of the first layer',
          },
          {
            name: 'Second layer',
            description: 'Description of the second layer',
          },
          {
            name: 'Third layer',
            description: 'Description of the third layer',
          },
        ],
        mutually_exclusive: true,
        name: 'Second group',
      },
    ],
    expanded: { 'Second group': true },
  },
}
