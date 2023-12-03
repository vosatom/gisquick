<template>
  <div :class="{loading: isFetching}">
    <div v-if="error" class="mx-2 error">Failed to fetch legend for <strong>{{ layer.title }}</strong></div>
    <LegendTable :data="data" v-else />
  </div>
</template>

<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import type { Legend } from './types'
import LegendTable from './LegendTable.vue'

const props = defineProps<{ url: string, layer: any }>()

const { data, isFetching, error } = useFetch(() => props.url, {
  refetch: true,
}).json<Legend>()
</script>

<style scoped>
.loading {
  opacity: 0.5;
}
.error {
  color: var(--color-red);
}
</style>