<template>
  <div>
    <div class="f-row-ac f-justify-center gap-4 mb-2" style="opacity: 0.7">
      <span class="f-row-ac gap-2" :title="tr.Ascent"
        ><v-icon name="arrow-up-right" /> {{ formatDistance(ascend, 0) }}</span
      >
      <span class="f-row-ac gap-2" :title="tr.Descent"
        ><v-icon name="arrow-down-right" />
        {{ formatDistance(descend, 0) }}</span
      >
    </div>
    <canvas ref="element" width="400"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  LineController,
  Tooltip,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js'
import { watch, computed, onMounted, ref } from 'vue'

import { formatDistance } from '../util/formatters'

import { useGettext } from '@/modules/vue-gettext'

const { $gettext } = useGettext()

const tr = computed(() => {
  return {
    MASL: $gettext('MASL'),
    Ascent: $gettext('Ascent'),
    Descent: $gettext('Descent'),
  }
})

Chart.register(
  LineController,
  LineElement,
  Tooltip,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
)

const props = defineProps<{
  distances: number[]
  elevations: number[]
  ascend: number
  descend: number
  color?: string
}>()

const color = computed(() => props.color ?? 'rgb(46, 108, 158)')

const emits = defineEmits(['hover', 'click'])

let chart: Chart
const element = ref()

const data = computed(() => ({
  labels: props.distances,
  datasets: [
    {
      data: props.elevations,
      fill: true,
      borderColor: color.value,
      backgroundColor: color.value,
      tension: 0,
      pointStyle: false,
    },
  ],
}))

onMounted(() => {
  const ctx = element.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: data.value,
    plugins: [
      {
        id: 'line',
        afterDraw: (chart) => {
          // https://stackoverflow.com/questions/68058199/chartjs-need-help-on-drawing-a-vertical-line-when-hovering-cursor
          if (chart.tooltip?._active?.length) {
            let x = chart.tooltip._active[0].element.x
            let yAxis = chart.scales.y
            let ctx = chart.ctx
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(x, yAxis.top)
            ctx.lineTo(x, yAxis.bottom)
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
            ctx.stroke()
            ctx.restore()
          }
        },
      },
    ],
    options: {
      onHover: function handleHover(evt, item) {
        const index = item[0]?.index ?? -1
        emits('hover', { index })
      },

      onClick(event, item, chart) {
        const index = item[0]?.index ?? -1
        emits('click', { event, index })
      },
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },

        tooltip: {
          mode: 'index',
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex
              const distance = props.distances[index]
              return formatDistance(distance, 1000)
            },
            label: (context) => {
              let label = ''
              if (context.parsed) {
                const value = context.parsed.y as number
                label = `${value.toFixed(0)} ${tr.value.MASL}`
              }
              return label
            },
          },
        },
      },
      interaction: {
        mode: 'x',
        intersect: false,
      },
      scales: {
        x: {
          type: 'linear',

          display: true,

          ticks: {
            maxRotation: 0,
            count: 5,
            stepSize: 1,
            callback: function (value) {
              return formatDistance(value)
            },
          },
        },
        y: {
          type: 'linear',
          display: true,
        },
      },
    },
  })

  element.value.addEventListener('mouseleave', function () {
    emits('hover', { index: -1 })
  })
})

watch(data, (data) => {
  if (!chart) return
  chart.data.labels = data.labels
  chart.data.datasets = data.datasets
  chart.update()
})
</script>
