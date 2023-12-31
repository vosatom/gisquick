<script setup lang="ts">
import { toValue, useDebounce } from '@vueuse/core'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { unref, ref, watchEffect } from 'vue'

import { useProvider } from '../routing/composables/useGetService'
import type { QueryPoint } from '../routing/store'

import { useOlMap } from '@/composables/useOlMap'
import type { AutocompleteItem } from '@/modules/services/base/types'
import { useAutocompleteService } from '@/modules/services/composables/useAutocompleteService'
import { useStore } from '@/store/typed'
import Autocomplete from '@/ui/Autocomplete.vue'

const map = useOlMap()

const props = defineProps<{
  placeholder: string
  point: QueryPoint
}>()

const emit = defineEmits(['update:point'])

const query = ref(undefined)
const throttledQuery = useDebounce(query, 400)

const store = useStore()
const userProjection = store.state.project.config.projection

const center = () => toLonLat(map.getView().getCenter() ?? [0, 0])

const extent = () =>
  transformExtent(map.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326')

const provider = useProvider('autocomplete')
const { loader, data, isLoading } = useAutocompleteService(provider, {
  query: throttledQuery,
  center,
  extent,
})

async function handleSelect(newItem: AutocompleteItem) {
  const _loader = unref(loader)
  if (!_loader || !_loader.autocompleteLookup || !data) return

  const result = newItem
    ? await _loader.autocompleteLookup({
        id: newItem.properties.id,
        autocompleteResults: toValue(data),
      })
    : undefined

  emit(
    'update:point',
    result
      ? {
          coordinates: fromLonLat(result.properties.coordinate, userProjection),
          text: result.properties.title,
          isInitialized: true,
          isTextAccurate: true,
        }
      : undefined,
  )
}

const autocompleteRef = ref()

watchEffect(() => {
  const text = props.point.properties.text
  if (typeof autocompleteRef.value !== 'undefined') {
    autocompleteRef.value.updateTextSilent(text)
  }
})
</script>

<template>
  <Autocomplete
    ref="autocompleteRef"
    class="f-grow"
    :placeholder="$props.placeholder"
    :items="data?.features ?? []"
    @text:update="query = $event"
    :loading="isLoading"
    highlight-fields="properties.title"
    @input="handleSelect"
  >
    <template v-slot:prepend>
      <slot name="prepend"/>
    </template>
    <template v-slot:item="{ html, active, selected }">
      <li
        :aria-selected="selected"
        :class="{ 'item f-row f-grow': true, highlighted: active }"
      >
        <div class="f-grow">
          <div class="title" v-html="html['properties.title']" />
        </div>
      </li>
    </template>
    <template v-slot:append>
      <slot name="append"/>
    </template>
  </Autocomplete>
</template>

<style lang="scss" scoped>
.autocomplete {
  margin: 6px;
  input {
    outline: none;
    border: none;
    flex-grow: 1;
    font-size: 15px;
  }
}
:deep(.popup-list) {
  border: 1px solid black;
  background: white;
  z-index: 1;
  position: relative;

  :deep(.item) {
    outline: none;
    border: 1px solid;
    border-color: transparent;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &.highlighted {
      border-color: var(--color);
      background-color: rgba(var(--color-rgb), 0.04);
    }
  }
}
</style>
