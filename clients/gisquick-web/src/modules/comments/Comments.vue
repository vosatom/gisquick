<template>
  <div>
    <div class="py-4" v-if="show">
      <h2 class="mb-2 px-1">
        <translate
          :translate-n="commentsCount"
          translate-plural="%{commentsCount} comments"
        >
          %{commentsCount} comment
        </translate>
      </h2>

      <Cusdis
        :key="id"
        :attrs="{
          appId: appId,
          pageId: id,
          host: baseUrl,
          pageUrl: pageUrl,
          pageTitle: title,
        }"
        :lang="locale"
        style="min-width: 250px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useFetch } from '@vueuse/core'
import { computed, watch } from 'vue'

import Cusdis from './Cusdis.vue'
import { getFeatureConfig } from '../routing/util/getFeatureConfig'

import { useStore } from '@/store/typed'

export default {
  components: { Cusdis },
  props: ['id', 'pageUrl', 'title', 'show'],
  emits: ['update'],
  setup(props, { emit }) {
    const store = useStore()

    const config = store.state.routing.config
    const featureConfig = getFeatureConfig(config, 'comments')
    if (!featureConfig) return
    const provider = config.providers[featureConfig.provider]
    const { baseUrl, appId, locale } = provider?.settings ?? {}

    const id = computed(() => props.id)
    const countUrl = computed(
      () =>
        `${baseUrl}/api/open/project/${appId}/comments/count?pageIds=${id.value}`,
    )

    const { data } = useFetch(countUrl, { refetch: true }).json()
    const commentsCount = computed(() => data.value?.data?.[id.value] ?? 0)
    watch(commentsCount, (value) => {
      if (value !== undefined) {
        emit('update', value)
      }
    })
    return { commentsCount, appId, id, baseUrl, locale }
  },
}
</script>
