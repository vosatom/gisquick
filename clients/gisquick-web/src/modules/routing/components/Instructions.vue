<template>
  <div>
    <ul @mouseout="activeInstructionIndex = -1" class="instruction-list">
      <li
        v-for="(instruction, index) in instructions"
        :key="index"
        @mouseover="activeInstructionIndex = index"
        @click="fitToInstruction(index)"
        class="instruction-item px-2 py-2"
      >
        <img
          :src="`/map/navigation/${instruction.sign}.svg`"
          v-if="showSigns"
        />
        <div class="instruction-text f-grow">
          <strong>{{ instruction.text }}</strong>
        </div>

        <div class="instruction-info f-row-ac">
          <img
            :src="walk"
            v-if="details.get_off_bike?.[index].includes(true)"
            :title="tr.GetOffBike"
          />
          <img
            :src="steps"
            v-if="details.road_class?.[index].includes('steps')"
            :title="tr.Steps"
          />

          <span v-if="instruction.time > 30" :title="tr.Duration">
            {{ formatDuration(instruction.time) }}
          </span>

          <span v-if="instruction.distance > 0" :title="tr.Distance">
            {{ formatDistance(instruction.distance) }}
          </span>
        </div>
      </li>
    </ul>

    <div ref="instructionPopupRef" class="instruction-overlay">
      <div v-if="activeInstruction" class="f-row-ac gap-1">
        {{ activeInstruction.text }}
        <img
          :src="walk"
          v-if="details.get_off_bike?.[activeInstructionIndex].includes(true)"
        />
        <img
          :src="steps"
          v-if="details.road_class?.[activeInstructionIndex].includes('steps')"
        />
      </div>

      <div class="instruction-overlay-background">
        <div class="instruction-arrow"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Feature, Overlay } from 'ol'
import { LineString, Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { ref, onMounted, computed, watch } from 'vue'

import { useVectorLayer } from '../composables/useVectorLayer'
import { instructionHoverStyle } from '../mapStyles'
import { formatDistance, formatDuration } from '../util/formatters'
import { getInstructionsDetails } from '../util/getInstructionsDetails'

import { useOlMap } from '@/composables/useOlMap'
import type { Path, Instruction, Interval } from '@/modules/services/base/types'
import { useGettext } from '@/modules/vue-gettext'
import { useStore } from '@/store/typed'
import { cssColor, interpolate } from '@/ui/utils/colors'

const steps = '/map/mnk/stairs.png'
const walk = '/map/mnk/walk.png'

const { $gettext } = useGettext()

const instructionPopupRef = ref()

const props = defineProps<{
  selectedPath: Path
  instructions: Instruction[]
  showSigns: boolean
}>()

const emit = defineEmits(['pan'])

const map = useOlMap()

const tr = computed(() => {
  return {
    Duration: $gettext('Duration'),
    Distance: $gettext('Distance'),
    ZoomTo: $gettext('Zoom to'),
    GetOffBike: $gettext('Get off bike'),
    Steps: $gettext('Steps'),
  }
})

const store = useStore()
const userProjection = store.state.project.config.projection

const activeInstructionIndex = ref(-1)
function fitToInstruction(index: number) {
  if (!props.selectedPath) return
  const instruction = props.selectedPath.instructions[index]
  const lineString = getPathOnInterval(props.selectedPath, instruction.interval)
  emit('pan', lineString.getExtent())
}

let instructionPopup
onMounted(() => {
  instructionPopup = new Overlay({
    element: instructionPopupRef.value,
    positioning: 'top-center',
    offset: [0, 10],
    className: 'ol-overlay-container ol-selectable ol-no-pointer',
  })
  map.addOverlay(instructionPopup)
})

const activeInstruction = computed(() => {
  if (!props.selectedPath || activeInstructionIndex.value === -1) return
  return props.selectedPath.instructions[activeInstructionIndex.value]
})
const hoverFeature = new Feature()
const hoverLayerlayer = useVectorLayer({
  style: instructionHoverStyle,
  source: new VectorSource({ features: [hoverFeature] }),
})

function getPathOnInterval(path: Path, interval: Interval) {
  if (interval[1] - interval[0] < 1) {
    return new Point(
      fromLonLat(path.points.coordinates[interval[0]], userProjection),
    )
  }
  return new LineString(
    path.points.coordinates.slice(interval[0], interval[1] + 1).map((coord) => {
      return fromLonLat(coord, userProjection)
    }),
  )
}

const highlightInterval = ref()

const highlightGeometry = computed(() => {
  if (!props.selectedPath) return undefined
  const interval = activeInstruction.value?.interval ?? highlightInterval.value
  return interval ? getPathOnInterval(props.selectedPath, interval) : undefined
})

watch(
  highlightGeometry,
  (highlightGeometry) => {
    if (!instructionPopup) return

    if (highlightGeometry) {
      instructionPopup.setPosition(highlightGeometry.getFirstCoordinate())
      hoverFeature.setGeometry(highlightGeometry)

      hoverFeature.set(
        'pathColor',
        cssColor(
          interpolate(props.selectedPath.color ?? '#7f7fff', '#000000', 0.5),
        ),
      )
      hoverLayerlayer.setVisible(true)
    } else {
      instructionPopup.setPosition(undefined)
      hoverLayerlayer.setVisible(false)
    }
  },
  { immediate: true },
)

const details = computed(() =>
  getInstructionsDetails(
    props.selectedPath.instructions,
    props.selectedPath.details,
  ),
)
</script>

<style scoped lang="scss">
.instruction-list {
  margin: 0;
  padding: 0;
}
.instruction-item {
  gap: 0.2em;
  display: flex;
  cursor: pointer;
  transition: background-color 0.4s;
}

.instruction-item:hover {
  background-color: rgba(#111, 0.1);
}

.instruction-item:active {
  background-color: rgba(#111, 0.18);
}

.instruction-text {
  strong {
    font-weight: 500;
  }
}

.instruction-info {
  gap: 1em;
  font-size: 0.95em;
  opacity: 0.88;
}

.instruction-actions {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.4s,
    visibility 0.4s;
}

.instruction-item:hover .instruction-actions {
  opacity: 1;
  visibility: visible;
}

.instruction-overlay {
  position: relative;
  padding: 0.2em 0.5em;
  border-radius: 5px;
  font-size: 0.9em;
  --overlay-background: white;
  color: black;
}

.instruction-overlay-background {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--overlay-background);
  padding: 5px;
  border-radius: 5px;
  opacity: 0.8;
  z-index: -1;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.4);
}

.instruction-arrow {
  background: var(--overlay-background);
  position: absolute;
  top: 0;
  left: 50%;
  z-index: -1;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  margin-left: -5px;
  margin-top: -5px;
  border-radius: 3px;
}

:global(.ol-no-pointer) {
  pointer-events: none !important;
}
</style>
