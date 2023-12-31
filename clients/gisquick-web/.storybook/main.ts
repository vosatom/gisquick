import { fileURLToPath, URL } from 'node:url'
import { StorybookConfig } from '@storybook/vue-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@/icons': fileURLToPath(new URL('../icons', import.meta.url)),
          '@storybook/vue3': '@storybook/vue'
        }
      }
    }
  }
};
export default config;
