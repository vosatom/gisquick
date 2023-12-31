<template>
  <Search v-if="props.isVisible && searchConfig" :providers="searchProviders" />
</template>
<script lang="ts" setup>
import { computed } from 'vue'

import Search from './Search.vue'
import { useProvider } from '../routing/composables/useGetService'
import { getFeatureConfig } from '../routing/util/getFeatureConfig'

import { useStore } from '@/store/typed'

const props = defineProps<{ isVisible: boolean }>()

const store = useStore()

const searchConfig = getFeatureConfig(store.state.routing.config, 'search')

const searchProviders = computed(
  () =>
    searchConfig?.provider
      .map((providerKey) => ({
        providerKey,
        provider: useProvider('search', providerKey),
      }))
      .filter((provider) => provider.provider),
)
</script>
