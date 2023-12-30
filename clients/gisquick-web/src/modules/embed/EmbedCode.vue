<template>
  <v-dialog :value="true" @closed="$emit('close')">
    <div class="f-col embed-dialog">
      <span class="panel-header toolbar dark top f-row-ac p-2">
        <translate class="title">Copy embed code</translate>
        <div class="actions f-grow f-row-ac f-justify-end">
          <v-btn class="icon dense" @click="$emit('close')">
            <v-icon name="x" />
          </v-btn>
        </div>
      </span>
      <div class="embed-content">
        <div class="f-grow p-2">
          <div>
            <v-switch v-model="settings.controls" class="round f-row-ac">
              <translate class="f-grow">Controls</translate>
            </v-switch>
            <v-switch v-model="settings.overlays" class="round f-row-ac">
              <translate class="f-grow">Overlays</translate>
            </v-switch>
            <v-switch v-model="settings.infopanel" class="round f-row-ac">
              <translate class="f-grow">Infopanel</translate>
            </v-switch>
            <v-switch
              v-model="settings.routing"
              class="round f-row-ac"
              v-if="queryParams.tool === 'routing'"
            >
              <translate class="f-grow">Routing</translate>
            </v-switch>
          </div>

          <div>
            <v-text-field
              multiline
              :value="code"
              readOnly
              class="code f-grow"
              @click="$event.target.select()"
            />

            <div class="f-row-ac">
              <v-btn
                color="primary"
                @click="copy(code)"
                v-if="isSupported"
                :key="copied"
              >
                <translate>Copy code</translate>
              </v-btn>
              <span v-if="copied" style="color: var(--color-green)">
                <translate>Code has been copied to clipboard.</translate>
              </span>
            </div>
          </div>
        </div>
        <div v-html="code" class="embed-preview"></div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, reactive } from 'vue'

import { useOlMap } from '@/composables/useOlMap'
import { createPermalink } from '@/modules/permalink/createPermalink'

const map = useOlMap()

const settings = reactive({
  overlays: true,
  infopanel: false,
  controls: true,
  routing: true,
})

const queryParams = computed(() => {
  const res = map.ext.getPermalinkQueryParams()
  return res
})

const featureUrl = computed(() => {
  const params = { ...queryParams.value }

  params.embed = 'true'
  params.controls = `${settings.controls}`

  if (settings.overlays === false) {
    params.overlays = 'null'
  }

  if (settings.routing === false) {
    params.tool = params.tool === 'routing' ? undefined : params.tool
    params.routing__points = undefined
    params.routing__profile = undefined
  }

  if (settings.infopanel === false) {
    params.tool = params.tool?.includes('identification')
      ? undefined
      : params.tool
    params.displayMode = 'none'
  }

  return createPermalink(location.href, params)
})

const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2500 })

const code = computed(() => {
  return `<iframe
  frameborder="0"
  src="${featureUrl.value}"
  width="100%"
  height="400px"
/>`
})
</script>

<style scoped>
.code :deep(.input textarea:read-only) {
  font-family: monospace;
  min-height: 250px;
}

.embed-dialog {
  width: 100%;
}

.embed-content {
  display: flex;
  flex-direction: column;
}

@media (min-width: 501px) {
  .embed-dialog {
    width: 1280px;
    max-width: 100vw;
  }
  .embed-content {
    flex-direction: row-reverse;
  }

  .embed-preview {
    width: 700px;
    max-width: 50vw;
  }
}
</style>
