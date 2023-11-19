import type { Meta } from '@storybook/vue'

export function createComponentStoryMeta(component) {
  return {
    render: (args) => ({
      components: { [component.name]: component },
      setup() {
        return { args }
      },
      template: `<${component.name} v-bind="args">{{args.default}}</${component.name}>`,
    }),
  } as Meta
}

export function createComponentStoryMetaWithValue(component) {
  return {
    render: (args) => ({
      components: { [component.name]: component },
      data() {
        return { value: args.value }
      },
      setup() {
        return { args }
      },
      template: `<${component.name} v-bind="args" :value="value" @input="value = $event">{{args.default}}</${component.name}>`,
    }),
  } as Meta
}
