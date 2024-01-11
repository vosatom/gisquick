import { type Meta } from '@storybook/vue3'

import ImageComponent from '@/components/image/Image.vue'

export default {
  title: 'Components/Image',
  component: ImageComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: { onResetView: {}, onDownload: {} },
  render: ({ onResetView, onDownload, ...args }) => ({
    components: { ImageComponent },
    setup() {
      return { args }
    },
    data() {
      return { open: true }
    },
    methods: { onResetView, onDownload, },
    template: `<div style="width:500px;"><ImageComponent v-bind="args" /></div>`,
  }),
} as Meta

export const Normal = {
  args: {
    src: '/src/assets/text_logo.svg'
  }
}
export const WrongImage = {
  args: {
    src: '/undefined.svg'
  }
}
