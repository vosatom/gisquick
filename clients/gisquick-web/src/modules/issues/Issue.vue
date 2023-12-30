<template>
  <div class="p-2" v-if="layer" style="--gutter: 0">
    <h3><translate>Found a problem on the route?</translate></h3>

    <a
      href="#"
      @click="
        (event) => {
          event.preventDefault()
          startEditing()
        }
      "
    >
      <translate>Report an issue</translate>
    </a>

    <PopupContent
      align="ll;bt"
      transition="slide-y"
      origin="notification"
      popup-class="f-col-ac"
      :bounds="bounds"
      :open="!!message"
      :popup-style="{ width: '100%' }"
    >
      <div class="popup-content notification f-row-ac p-2 m-4">
        <v-icon name="check" />
        <span class="m-2" v-text="message" />
        <v-btn class="small flat" color="yellow" @click="message = null">
          <translate>Close</translate>
        </v-btn>
      </div>
    </PopupContent>

    <portal to="right-panel">
      <div
        v-if="newFeatureMode && layer"
        class="info-panel window f-col mx-1 mb-2 shadow-2"
      >
        <div class="panel-header f-row-ac dark">
          <translate class="title mx-2 f-grow">New issue</translate>
          <v-btn class="icon small" @click="newFeatureMode = false">
            <v-icon name="x" />
          </v-btn>
        </div>
        <scroll-area>
          <NewFeatureEditor
            :layer="layer"
            toolbar-target="toolbar"
            @edit="newFeatureAdded"
          />
        </scroll-area>
        <portal-target name="toolbar" class="toolbar" />
      </div>
    </portal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import { useGettext } from '../vue-gettext'

import NewFeatureEditor from '@/components/feature-editor/NewFeatureEditor.vue'
import { useOlMap } from '@/composables/useOlMap'
import { useStore } from '@/store/typed'
import PopupContent from '@/ui/PopupContent.vue'
import { elementBounds } from '@/ui/utils/popup'

const map = useOlMap()

const { $gettext } = useGettext()

const newFeatureMode = ref(false)
const bounds = ref(null)
const message = ref(null)

const store = useStore()

const project = computed(() => store.state.project)

const layer = computed(() => {
  return (
    project.value.config.custom &&
    project.value.config.custom.report_issue &&
    project.value.config.custom.report_issue_layer_name &&
    project.value.overlays.list.find(
      (l) => l.name === project.value.config.custom.report_issue_layer_name,
    )
  )
})

function startEditing() {
  const editingNeedsLogin = true
  const isLoggedIn = !store.state.user.is_guest
  if (editingNeedsLogin && !isLoggedIn) {
    store.commit('showLogin', true)
  } else {
    newFeatureMode.value = true
  }
}

function newFeatureAdded(respXML) {
  map.ext.refreshOverlays()

  newFeatureMode.value = false

  const msg = $gettext('Thank you for reporting an issue.')
  message.value = msg
  bounds.value = elementBounds(document.body)

  const fids = []
  const features = respXML.querySelector('Feature')?.children
  if (features) {
    for (var i = 0; i < features.length; i++) {
      const feature = features[i]
      const fid = feature.getAttribute('fid')
      if (fid) fids.push(fid)
    }
    store.commit('identification/setInitialFeatureIds', fids.join(','))
  }
}

watch(newFeatureMode, () => {
  store.commit('activeTool', 'issue')
})
</script>

<style>
.window {
  overflow: hidden;
  width: 20em;
  border-radius: 3px;
  border: 1px solid #aaa;
  background-color: #fff;
  position: relative;
  .toolbar {
    background-color: #e0e0e0;
    border-top: 1px solid #bbb;
  }
}
</style>
