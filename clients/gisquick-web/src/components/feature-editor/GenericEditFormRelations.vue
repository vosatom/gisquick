<template>
  <div ref="container">
    <template v-if="layer.relations">
      <div
        v-for="relation in layer.relations"
        :key="relation.name"
        class="relations"
      >
        <div v-if="data[relation.name]">
          <div
            class="relations-header f-row-ac px-2"
            @click="toggleExpand(relation.name)"
          >
            <span class="label" v-text="relation.name" />
            <span v-if="data[relation.name]" class="mx-2">
              ({{ data[relation.name].length }})
            </span>
            <div class="f-grow" />
            <div>
              <v-btn
                @click.stop="addFeature(relation)"
                :aria-label="tr.Add"
                class="small icon"
              >
                <v-icon name="plus" />
              </v-btn>
            </div>
            <v-icon
              class="toggle mx-2"
              :class="{
                expanded: expanded[relation.name],
                disabled: data[relation.name].length === 0,
              }"
              name="arrow-down"
              size="12"
            />
          </div>
          <div class="f-col px-2 mb-2" v-if="expanded[relation.name]">
            <div
              v-for="(relatedItem, index) in data[relation.name]"
              :key="relatedItem[TEMP_ID_KEY] ?? relatedItem.id"
            >
              <div class="f-row-ac relation-title px-2">
                <strong class="f-grow">
                  <span v-if="relatedItem.id">{{ relatedItem.id }}</span>
                  <translate v-else>New item</translate>
                </strong>

                <v-btn
                  class="small"
                  color="red"
                  outlined
                  @click="deleteFeature(relation, relatedItem)"
                >
                  <translate>Delete</translate>
                </v-btn>
              </div>

              <GenericEditFormRelation
                :layer="relation.referencing_layer"
                :data="relatedItem"
                :initialData="initialData[relation.name][index]"
                @input="updateFeature(relation, relatedItem)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, set } from 'vue'
import { mapState } from 'vuex'

import { createFeature } from './createFeature'
import { difference } from './difference'
import GenericEditFormRelation from './GenericEditFormRelation.vue'
import { resolveFields } from './resolveFields'
import type {
  RelationsFeaturesWithData,
  RelationsData,
  Layer,
  Fields,
  Value,
} from './types'
import { TEMP_ID_KEY } from './util'

import { wfsTransaction } from '@/map/wfs'
import type { Relation } from '@/store/interfaces'
import { getScrollableParent } from './getScrollParent'

function getFeatureFields(
  relations: Relation[],
  relationsData?: RelationsFeaturesWithData,
) {
  const result: RelationsData = {}
  if (relationsData) {
    for (const relationName in relationsData) {
      const features = relationsData[relationName]
      result[relationName] = features.map((feature) => feature.getProperties())
    }
  }

  relations.forEach((relation) => {
    if (!(relation.name in result)) {
      result[relation.name] = []
    }
  })

  return result
}

export default defineComponent({
  props: {
    layer: {
      type: Object as PropType<Layer>,
      required: true,
    },
    relationsData: {
      type: Object as PropType<RelationsFeaturesWithData>,
    },
  },
  refs: ['container'],
  components: { GenericEditFormRelation },
  setup() {
    return { TEMP_ID_KEY }
  },
  data() {
    const expanded = {} as Record<string, boolean>
    if (this.layer.relations.length) {
      expanded[this.layer.relations[0].name] = true
    }

    return {
      expanded,
      modified: false,
      data: {} as RelationsData,
      initialData: {} as RelationsData,
      changes: {
        insert: {},
        delete: {},
        update: {},
      } as Record<string, Record<string, string>>,
    }
  },
  computed: {
    ...mapState(['project']),
    tr() {
      return {
        Add: this.$gettext('Add'),
      }
    },
  },
  watch: {
    relationsData: {
      immediate: true,
      handler(relationsData = {}) {
        this.data = getFeatureFields(this.layer.relations, relationsData)
        this.initialData = getFeatureFields(this.layer.relations, relationsData)

        this.modified = false
        this.changes = {
          insert: {},
          delete: {},
          update: {},
        }
      },
    },
  },
  methods: {
    restore() {
      this.data = getFeatureFields(this.layer.relations, this.relationsData)
      this.modified = false
    },

    toggleExpand(relationName: string) {
      const isExpanded = this.expanded[relationName]
      set(this.expanded, relationName, !isExpanded)
    },

    async updateFeature(relation: Relation, relatedItem: Fields) {
      const id = (relatedItem[TEMP_ID_KEY] ?? relatedItem.id) as Value
      if (!id) return

      this.modified = true
      if (!(id in this.changes.insert)) {
        this.changes.update[id] = relation.name
      }
    },

    async deleteFeature(relation: Relation, relatedItem: Fields) {
      const id = (relatedItem[TEMP_ID_KEY] ?? relatedItem.id) as Value
      if (!id) return

      const relationData = this.data[relation.name]
      const index = relationData.findIndex((item) => item === relatedItem)
      relationData.splice(index, 1)

      this.modified = true
      if (!this.changes.insert[id]) {
        this.changes.delete[id] = relation.name
      }
      delete this.changes.insert[id]
      delete this.changes.update[id]
    },

    addFeature(relation: Relation) {
      const newId = Math.random() + ''

      const newFeature = {
        id: null,
        poi_id: null,
        photo: null,
        [TEMP_ID_KEY]: newId,
      }

      const relationData = this.data[relation.name]
      relationData.push(newFeature)

      this.modified = true

      this.changes.insert[newId] = relation.name

      set(this.expanded, relation.name, true)

      const scrollableParent = getScrollableParent(this.$refs.container as Element | null)
      if (scrollableParent) {
        this.$nextTick(() => {
          scrollableParent.scrollTo({
            top: scrollableParent.scrollHeight,
            behavior: 'smooth',
          })
        })
      }
    },

    async resolveRelations(parentFid: string, options: { username: string }) {
      const owsUrl = this.project.config.ows_url

      const tasks = []
      for (const operation in this.changes) {
        for (const id in this.changes[operation]) {
          const relationName = this.changes[operation][id]
          const relation = this.layer.relations.find(
            (relation) => relation.name === relationName,
          )
          if (!relation) continue
          const layer = relation.referencing_layer
          const featureId = `${layer.name}.${id}`

          if (operation === 'update') {
            const initialFields = this.initialData[relationName].find(
              (item) => `${item[TEMP_ID_KEY] ?? item.id}` === id,
            )
            const fields = this.data[relationName].find(
              (item) => `${item[TEMP_ID_KEY] ?? item.id}` === id,
            )
            const relationResolvedFields = await resolveFields(
              'update',
              layer,
              fields,
              options,
            )
            const changedFields = difference(
              relationResolvedFields,
              initialFields,
            )
            if (Object.keys(changedFields).length) {
              const newFeature = createFeature(changedFields)
              newFeature.setId(featureId)
              tasks.push(() =>
                wfsTransaction(owsUrl, layer.name, { updates: [newFeature] }),
              )
            }
          } else if (operation === 'delete') {
            const feature = this.relationsData?.[relationName].find(
              (item) => item.getId() === featureId,
            )
            if (feature) {
              tasks.push(() =>
                wfsTransaction(owsUrl, layer.name, { deletes: [feature] }),
              )
            }
          } else if (operation === 'insert') {
            const fields = this.data[relationName].find(
              (item) => (item[TEMP_ID_KEY] ?? item.id) === id,
            )
            const relationResolvedFields = await resolveFields(
              'insert',
              layer,
              fields,
              options,
            )
            delete relationResolvedFields[TEMP_ID_KEY]
            const [, parentId] = parentFid.split('.')

            for (const index in relation.referencing_fields) {
              const key = relation.referencing_fields[index]
              relationResolvedFields[key] = parentId
            }
            const newFeature = createFeature(relationResolvedFields)
            tasks.push(() =>
              wfsTransaction(owsUrl, layer.name, { inserts: [newFeature] }),
            )
          }
        }
      }

      await tasks.reduce((prev, next) => prev.then(next), Promise.resolve())

      this.modified = false
    },
  },
})
</script>

<style scoped>
.relations-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff;
  cursor: pointer;
}

.relation-title {
  background-color: #e6e6e6;
}

.toggle {
  transition: 0.2s transform;
}
.toggle.expanded {
  transform: rotate(-180deg);
}
.toggle.disabled {
  opacity: 0.4;
}
</style>
