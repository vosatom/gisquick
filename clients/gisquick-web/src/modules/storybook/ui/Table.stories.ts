import type { Meta, StoryObj } from '@storybook/vue3'

import Table from '@/ui/Table.vue'

export default {
  title: 'UI Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  render: args => ({
    components: { Table },
    data() {
      return { value: args.value }
    },
    setup() {
      return { args }
    },
    template: `<div style="width:500px"><Table
    class="f-grow"
    item-key="_id"
    v-bind="args"
  >
    <template v-slot:cell(actions)="{ row }">
      <v-btn class="icon flat m-0">
        <v-icon name="zoom-to"/>
      </v-btn>
    </template>
    <template v-for="(slot, name) in slots" v-slot:[\`cell(\${name})\`]="{ item }" :key="name">
      <component
        :is="slot.component"
        :attribute="slot.attribute"
        :value="item[name]"
      />
    </template>
  </Table></div>`,
  }),

  args: {
    label: 'Label',
  },
} as Meta

type Story = StoryObj<typeof Table>

export const Primary: Story = {
  args: {
    items: [
      { _id: '1', name: 'Lorem', age: 123 },
      { _id: '2', name: 'Ipsum', age: 456 },
    ],
    columns: [
      {
        text: 'name',
        key: 'name',
        sortable: true,
        label: 'Name',
        header: {
          width: 1,
        },
      },
      {
        text: 'age',
        key: 'age',
        sortable: true,
        label: 'Age',
        header: {
          width: 1,
        },
      },
      {
        text: '',
        key: 'actions',
        sortable: false,
        header: {
          width: 1,
        },
      },
    ],
  },
}
