
<template>
  <div class="f-col">
    <slot
      name="form"
      :fields="fields"
      :layer="layer"
    >
      <generic-edit-form
        class="f-grow"
        :layer="layer"
        :fields="fields"
        :project="project.config"
        :attributeKeys="layer.info_panel_fields"
      />
      <generic-edit-form-relations
        v-if="layer.relations"
        ref="relationsForm"
        :layer="layer"
      />
    </slot>
    <portal
      :to="toolbarTarget"
      :disabled="!toolbarTarget"
    >
      <div class="toolbar f-row-ac">
        <geometry-editor
          :editor.sync="references.geometryEditor"
          :geometry-type="geomType"
        />
        <div class="v-separator"/>
        <v-btn
          :aria-label="tr.SaveChanges"
          class="icon"
          :disabled="status === 'loading'"
          @click="save"
        >
          <v-tooltip slot="tooltip">
            <translate>Save changes</translate>
          </v-tooltip>
          <v-icon color="green" name="save"/>
        </v-btn>
      </div>
    </portal>
    <transition name="fade">
      <div v-if="status" class="notification f-row">
        <div
          class="content shadow-2 f-row-ac p-2"
          :class="status"
        >
          <progress-action class="mr-2" :status="status"/>
          <translate v-if="status === 'loading'" key="pending">Updating data</translate>
          <translate v-else-if="status === 'success'" key="success">Data updated</translate>
          <span v-else key="error" v-text="errorMsg"/>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="js">
import { mapState } from 'vuex'

import { queuedUpdater, ShallowObj } from '@/utils'
import { wfsTransaction } from '@/map/wfs'
import GeometryEditor from './GeometryEditor.vue'
import GenericEditForm from './GenericEditForm.vue'
import ProgressAction from '@/components/ProgressAction.vue'
import { resolveFields } from './resolveFields'
import { createFeature } from './createFeature'
import GenericEditFormRelations from './GenericEditFormRelations.vue'

export default {
  name: 'NewFeatureEditor',
  components: { GeometryEditor, GenericEditForm, ProgressAction, GenericEditFormRelations },
  refs: ['relationsForm'],
  props: {
    layer: Object,
    toolbarTarget: String
  },
  data () {
    return {
      status: '',
      errorMsg: '',
      fields: null,
      references: ShallowObj({
        geometryEditor: null
      })
    }
  },
  computed: {
    ...mapState(['project']),
    tr () {
      return {
        SaveChanges: this.$gettext("Save changes"),
      }
    },
    geomType () {
      return this.layer.wkb_type || {
        POINT: 'MultiPoint',
        LINE: 'MultiLineString',
        POLYGON: 'MultiPolygon'
      }[this.layer.geom_type]
    },
    relationsModified () {
      const editor = this.$refs.relationsForm
      return editor?.modified
    },
  },
  watch: {
    layer: {
      immediate: true,
      handler (layer) {
        const fields = {}
        layer.attributes.forEach(attr => {
          let defaultValue = null
          if (attr.name === 'status_id') {
            defaultValue = 4
          }
          fields[attr.name] = defaultValue
        })

        this.fields = fields
      }
    }
  },
  created () {
    this.statusController = queuedUpdater(v => { this.status = v })
  },
  methods: {
    showError (err) {
      console.error(err);
      this.errorMsg = err.message || this.$gettext('Error')
      this.statusController.set('error', 3000)
      this.statusController.set(null, 100)
    },
    async save () {
      const options = { username: this.$store.state.user.username }

      let resolvedFields
      try {
        resolvedFields = await resolveFields('insert', this.layer, this.fields, options)
      } catch (err) {
        this.showError(err)
        return
      }
      const f = createFeature(resolvedFields)
      const geom = this.references.geometryEditor.getGeometry()
      // Transform to projection of project
      let newGeom = geom
      const mapProjection = this.$map.getView().getProjection().getCode()
      if (newGeom && mapProjection !== this.layer.projection) {
        newGeom = newGeom.clone()
        newGeom.transform(mapProjection, this.layer.projection)
      }
      f.setGeometry(newGeom)

      try {
        this.statusController.set('loading', 1000)
        const respXML = await wfsTransaction(this.project.config.ows_url, this.layer.name, { inserts: [f] })

        const fid = respXML?.querySelector('Feature')?.firstElementChild?.getAttribute('fid')
        if (this.layer.relations) {
          if (fid) {
            const relationsModified = this.relationsModified
            if (relationsModified) {
              const form = this.$refs.relationsForm
              if (form) {
                await form.resolveRelations(fid, options)
              }
            }
          }
        }
        
        this.$emit('edit', { respXML, fid })
        await this.statusController.set('success', 1500)
        this.statusController.set(null, 100)
      } catch (err) {
        this.showError(err)
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  ::v-deep .btn.icon {
    margin: 3px 2px;
    width: 26px;
    height: 26px;
  }
}
.notification {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.2);
  svg {
    border: 1px solid currentColor;
    border-radius: 50%;
    // color: var(--icon-color);
  }
  .content {
    width: 150px;
    font-size: 14px;
    border-radius: 3px;
    margin: 6px;
    background-color: #444;
    color: #fff;
    transition: 0.4s ease;
    &.error {
      background-color: var(--color-red);
    }
  }
}
</style>
