import { themes } from '@storybook/theming'

import { setup } from './setup'
import store from '../src/store/index'

setup()

/** @type { import('@storybook/vue').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme: themes.light,
    },
  },
  decorators: [
    () => ({
      store,
      template:
        '<div class="light"><popup-layer class="light"/><div style="min-width:400px;"><story/></div></div>',
    }),
  ],
}

export default preview
