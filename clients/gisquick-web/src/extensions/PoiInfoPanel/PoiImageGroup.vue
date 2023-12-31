<template>
  <ImageGroup
    class="image-group"
    :src="data.map((p) => p.get(photoAttributeName))"
    :thumbnail="data.map((p) => getThumbUrl(p.get(photoAttributeName)))"
    :alt="data.map((p) => p.get('name'))"
  >
    <template #loading>
      <translate class="loading">Loading...</translate>
    </template>
  </ImageGroup>
</template>

<script setup lang="ts">
import { getFileService } from '@/components/GenericInfopanel.vue'
import ImageGroup from '@/components/image/ImageGroup.vue'
import type { Project } from '@/store/interfaces'

const photoAttributeName = 'photo'

const props = defineProps<{
  layer: Layer
  project: Project
  relation: any
  data: any[]
}>()

const attr = props.relation.layer.attributes.find(
  (a) => a.name === photoAttributeName,
)
const service = getFileService(attr, props.project.storage)

function getThumbUrl(src: string) {
  const url = new URL(
    '/api/project/media_file/' + props.project.name,
    window.location.href,
  )
  url.searchParams.append('thumbnail', 'true')
  url.searchParams.append('src', src)
  url.searchParams.append('provider_id', service?.id)
  return url.toString()
}
</script>

<style scoped>
.image-group {
  position: relative;
  min-width: 285px;
}
.loading {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.75);
  padding: 5px 10px;
  margin: 5px;
  border-radius: 3px;
}
</style>
