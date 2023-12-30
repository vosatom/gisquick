<template>
  <div class="px-2 bookmarks" v-if="bookmarks.length">
    <div v-if="currentBookmark">
      <h4>{{ currentBookmark.name }}</h4>
      <div v-html="currentBookmark.content" v-if="currentBookmark.content" />
    </div>

    <p>
      <translate>
        Interested in other cities? Select it from the list.
      </translate>
    </p>

    <v-menu :items="bookmarks" @confirm="setBookmark($event)">
      <template v-slot:activator="{ toggle }">
        <a
          href="#"
          @click="
            (event) => {
              event.preventDefault()
              toggle()
            }
          "
        >
          <translate>Change city</translate>
        </a>
      </template>
      <template v-slot:item="{ item }">
        {{ item.name }}
      </template>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { getCenter } from 'ol/extent'
import { ref, onMounted, computed } from 'vue'

import { findClosestExtent } from './findClosestExtent'

import { useOlMap } from '@/composables/useOlMap'
import type { Bookmark } from '@/store/interfaces'
import { useStore } from '@/store/typed'

const store = useStore()
const map = useOlMap()

const bookmarks = computed(() => {
  // Flatten bookmark groups
  const result: Bookmark[] = []
  Object.values(store.state.project.config.bookmarks).forEach((group) => {
    Object.values(group).forEach((bookmark) => {
      result.push(bookmark)
    })
  })
  return result
})

const center = ref(map.getView().getCenter())

const currentBookmark = computed(() =>
  center.value && bookmarks.value
    ? findClosestExtent(bookmarks.value, center.value)
    : undefined,
)

function setBookmark(bookmark: Bookmark) {
  let padding = map.ext.visibleAreaPadding()

  map.getView().setRotation((bookmark.rotation * Math.PI) / 180)
  map.getView().fit(bookmark.extent, { padding })

  center.value = getCenter(bookmark.extent)
}

onMounted(() => {
  setTimeout(() => {
    center.value = map.getView().getCenter()
  }, 100)
})
</script>

<style scoped>
.bookmarks {
  --gutter: 0;
}
</style>
