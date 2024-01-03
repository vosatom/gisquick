<template>
  <AddressAutocomplete
    :key="point.properties.id"
    class="f-grow f-row-ac"
    :class="{
      'query-row': true,
      draggable: props.canMove,
      'is-initialized': point.properties.isInitialized,
      'f-row': true,
    }"
    :point="point"
    @update:point="
      ({ coordinates, ...properties } = {}) => {
        if (coordinates) {
          store.commit(MutationKey.setPoint, {
            index,
            properties,
            coordinates,
          })
        } else {
          store.commit(MutationKey.removePoint, {
            id: point.properties.id,
            clearValueOnly: true,
          })
        }

        askForFitMap()
      }
    "
    :placeholder="label"
  >
    <template v-slot:prepend>
      <div :class="{ 'query-row-icon': true, handle: props.canMove }">
        <div class="handle-icon f-row-ac f-justify-center">
          <v-icon
            :aria-label="label"
            name="pin"
            :color="
              point.properties.type === QueryPointType.Start
                ? 'green'
                : point.properties.type === QueryPointType.End
                  ? 'red'
                  : undefined
            "
          />
        </div>
      </div>
    </template>
    <template v-slot:append>
      <v-btn
        class="icon"
        @click="
          store.commit(MutationKey.removePoint, { id: point.properties.id })
        "
        :title="tr.RemoveWaypoint"
      >
        <v-icon name="delete_forever" />
      </v-btn>

      <v-btn
        v-if="canAdd"
        class="icon add-button"
        @click="store.commit(MutationKey.addPoint, { index: index + 1 })"
        :title="tr.AddWaypoint"
      >
        <v-icon name="plus" />
      </v-btn>
    </template>
  </AddressAutocomplete>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { MutationKey, QueryPointType, type QueryPoint } from '../store'

import AddressAutocomplete from '@/modules/search/AddressAutocomplete.vue'
import { useGettext } from '@/modules/vue-gettext'
import { useStore } from '@/store/typed'

const store = useStore()
const { $gettext } = useGettext()

const props = defineProps<{
  index: number
  point: QueryPoint
  canAdd: boolean
  canMove: boolean
  askForFitMap: () => void
  moveWaypoint: (fromIndex: number, toIndex: number) => void
}>()

const tr = computed(() => {
  return {
    From: $gettext('From'),
    To: $gettext('To'),
    Waypoint: $gettext('Waypoint'),
    RemoveWaypoint: $gettext('Remove waypoint'),
    AddWaypoint: $gettext('Add waypoint'),
  }
})

const label = computed(() => {
  if (props.point.properties.type === QueryPointType.Start) return tr.value.From
  if (props.point.properties.type === QueryPointType.End) return tr.value.To
  return tr.value.Waypoint
})
</script>

<style scoped>
.query-row {
  align-items: center;
  margin: 0 0 -1px 0;
  padding: 5px 0;
  position: relative;
  border: 1px solid #dddddd;
  border-width: 1px;

  &:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
  &:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &.focused :deep(.input:after) {
    display: none;
  }
}

.query-row.is-initialized {
  background: #eeeeee;
}

.query-row.focused {
  border-color: #9e9e9e;
  z-index: 1;
}

.sortable-ghost {
  opacity: 0;
}

.query-row-icon {
  text-align: center;
  padding-inline-start: 0.5em;
}

.handle {
  cursor: grab;
}

.handle-icon {
  min-width: 1.8em;
}

.badge {
  min-width: 1.8em;
  height: 1.8em;
  padding: 0 0.35em;
  background: var(--color-primary);
  color: white;
  border-radius: 2em;
}

.btn.add-button {
  position: absolute;
  bottom: 0;
  padding: 0 0.4em;
  margin: 0;
  margin-bottom: -1em;
  left: 0.35em;
  z-index: 1;

  opacity: 0;
  visibility: hidden;
}

.draggable:hover .add-button {
  opacity: 1;
  visibility: visible;
}
</style>
