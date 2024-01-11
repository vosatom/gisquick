import { type Meta } from '@storybook/vue3'

import MediaFileField from '@/components/feature-editor/MediaFileField.vue'
import project from '@/modules/storybook/mocks/project.json'

export default {
  title: 'Components/Image/Image Editor',
  component: MediaFileField,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { MediaFileField },
    setup() {
      return { args }
    },
    template: `<div>
    <MediaFileField v-bind="args" />
    </div>`,
  }),
} as Meta

export const Primary = {
  args: {
    url: '/src/assets/text_logo.svg',
    location: '/',
    filename: 'text_logo.svg',
    label: 'File',
    value: '/src/assets/text_logo.svg',
    disabled: false,
    options: {
      max_resolution: 100,
      max_size: 100,
    },
    allowTuning: '',
    uploadUrl: '',
    service: project.storage.find((storage) => storage.type === 'local'),
  },
}

export const NoFile = {
  args: {
    url: null,
    location: '/',
    filename: null,
    label: 'File',
    value: null,
    disabled: false,
    options: {
      max_resolution: 100,
      max_size: 100,
    },
    allowTuning: '',
    uploadUrl: '',
    service: project.storage.find((storage) => storage.type === 'local'),
  },
}
