<template>
  <div v-if="feature" class="f-col info-panel light">
    <div class="toolbar dark top f-row-ac">
      <v-select
        class="flat f-grow my-0"
        :disabled="layersOptions.length < 2"
        :items="layersOptions"
        :value="selected ? selected.layer : layersOptions[0].value"
        @input="setActiveLayer"
      />
      <v-btn
        class="icon flat"
        :disabled="index === 0"
        @click="setSelected(index - 1)"
      >
        <v-icon name="arrow-left" size="16"/>
      </v-btn>
      <span v-if="selected" style="font-size: 14px">
        {{ index + 1 }}/{{ features.length }}
      </span>
      <v-spinner v-else size="16" width="2"/>
      <v-btn
        class="icon flat"
        :disabled="index === features.length - 1"
        @click="setSelected(index + 1)"
      >
        <v-icon name="arrow-right" size="16"/>
      </v-btn>
      <v-btn @click="$emit('close')" class="icon flat">
        <v-icon name="x"/>
      </v-btn>
    </div>

    <div class="content-layout">
      <scroll-area>
        <div>
          <feature-editor
            v-if="editMode"
            ref="featureEditor"
            class="edit-form"
            toolbar-target="infopanel-tool"
            :feature="feature"
            :relationsData="relationsData"
            :layer="layer"
            :project="$store.state.project.config"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
          <component
            v-else
            :is="formComponent"
            :feature="feature"
            :relationsData="relationsData"
            :layer="layer"
            :project="$store.state.project.config"
          />
        </div>
      </scroll-area>

      <div class="toolbar tools dark f-row-ac">
        <v-btn class="icon flat" @click="zoomToFeature" :disabled="!this.feature.getGeometry()">
          <v-icon name="zoom-to"/>
        </v-btn>
        <v-btn
          v-if="layerEditable"
          class="icon flat"
          :color="editMode ? 'primary' : null"
          @click="$emit('update:editMode', !editMode)"
        >
          <v-icon name="edit"/>
        </v-btn>
      </div>
      <portal-target
        name="infopanel-tool"
        class="toolbar-portal toolbar left"
      />
    </div>
  </div>
</template>

<script lang="js">
import GenericInfopanel from '@/components/GenericInfopanel.vue'
import FeatureEditor from '@/components/feature-editor/FeatureEditor.vue'
import { externalComponent } from '@/components-loader'
import PoiInfoPanel from '@/extensions/PoiInfoPanel/PoiInfoPanel'
import { fetchRelationsData } from './fetchRelationsData'
import { onKeyDown } from '@vueuse/core'

export default {
  name: 'info-panel',
  components: { GenericInfopanel, FeatureEditor },
  refs: ['featureEditor'],
  props: {
    selected: Object,
    layer: Object,
    features: Array,
    layers: Array,
    editMode: Boolean
  },
  data() {
    return {
      relationsData: null,
    }
  },
  mounted() {
    onKeyDown('Escape', (event) => {
      if (this.editMode && (event.shiftKey || !this.$refs.featureEditor?.isModified)) {
        this.$emit('update:editMode', false)
      } else if (!this.editMode) {
        this.$emit('close')
      }
    })
    onKeyDown(true, (event) => {
      const modifierKeyPressed = event.metaKey || event.ctrlKey
      if (!modifierKeyPressed) return

      let action = ''
      const key = event.code
      if (key === 'KeyS') action = 'save'
      if (key === 'KeyE') action = 'edit'
      
      switch(action) {
        case 'save':{
          if (this.$refs.featureEditor?.save) {
            this.$refs.featureEditor?.save()
          }
          break
        }
        case 'edit':{
          this.$emit('update:editMode', true)
          break
        }
      }
      if (action) {
        event.preventDefault()
      }
    })
  },
  computed: {
    layersOptions () {
      const layers = this.layers || [this.layer]
      return layers.map(layer => ({
        text: layer.title || layer.name,
        value: layer.name
      }))
    },
    index () {
      return this.selected && this.selected.featureIndex
    },
    feature () {
      return this.selected && this.features[this.index]
    },
    formComponent () {
      if (this.layer.infopanel_component === 'PoiInfoPanel') {
        return PoiInfoPanel
      }
      if (this.layer.infopanel_component) {
        try {
          const project = this.$store.state.project.config
          return externalComponent(project, this.layer.infopanel_component)
        } catch (err) {
          console.error(`Failed to load infopanel component: ${this.layer.infopanel_component}`)
        }
      }
      return GenericInfopanel
    },
    layerEditable () {
      const { permissions = {} } = this.layer
      return permissions.update || permissions.delete
    }
  },
  watch: {
    feature: {
      immediate: true,
      async handler (f) {
        if (this.layer.relations) {
          delete f._relationsData
          this.relationsData = null
          this.relationsData = await this.fetchRelationsData(this.layer, f)
        } else {
          this.relationsData = null
        }
      }
    },
  },
  methods: {
    setActiveLayer (layer) {
      this.$emit('selection-change', { layer, featureIndex: 0 })
    },
    setSelected (featureIndex) {
      this.$emit('selection-change', { layer: this.selected.layer, featureIndex })
    },
    zoomToFeature () {
      this.$map.ext.zoomToFeature(this.feature)
    },
    fetchRelationsData (layer, feature) {
      return fetchRelationsData(this.$http, this.$store.state.project, layer, feature)
    }
  }
}
</script>

<style lang="scss" scoped>
.info-panel {
  position: relative;
  border-radius: 6px;
  // border: 1px solid #aaa;
  background-color: #fff;
  overflow: hidden;
  @media (min-width: 501px) {
    .generic-infopanel, .edit-form {
      width: 400px;
    }
  }

  .toolbar {
    flex-shrink: 0;
    &.top {
      background-color: #444;
      height: 36px;
      line-height: 1;
      --fill-color: transparent;
      .i-field ::v-deep .input {
        height: 28px;
      }
    }
    &.tools {
      flex: 0 0 auto;
      align-self: end;
      justify-self: end;
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;

      bottom: 2px;
      margin-top: 1px;
      margin-bottom: 2px;
      padding-left: 6px;
      overflow: visible;
      background-color: rgba(#555, 0.5);
      z-index: 1;
      height: 24px;
      .btn {
        margin: 0 3px;
      }
      .icon {
        width: 18px;
        height: 18px;
      }
    }
  }
  .content-layout {
    overflow: hidden;
    position: relative;
    display: grid;
    grid-template-rows: 1fr minmax(8px, auto);
    .scroll-container {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
    }
    .tools {
      grid-row: 1 / 3;
      grid-column: 1 / 2;
    }
    .toolbar-portal {
      grid-row: 2 / 3;
      grid-column: 1 / 2;
      background-color: #e0e0e0;
      border-top: 1px solid #bbb;
      align-self: end;
    }
  }
}


@media (max-width: 500px) {
  .info-panel {
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
