<template>
  <div v-if="data">
    <div
      v-for="(node, nodeIndex) in data?.nodes"
      class="item link px-2 py-2 mb-2"
      :key="nodeIndex"
    >
      <strong>{{ node.title }}</strong>
      <div v-if="node.symbols">
        <table class="legend-table">
          <tr v-for="(symbol, index) in node.symbols" :key="index">
            <td>
              <img
                :src="symbol.icon.includes('http') ? symbol.icon : `data:image/png;base64,${symbol.icon}`"
                :alt="symbol.title"
              />
            </td>
            <td class="legend-content">
              <span class="legend-title">{{ symbol.title }}</span>
              <span class="legend-description" v-if="symbol.description">
                {{ symbol.description }}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div v-else>
        <table class="legend-table">
          <tr>
            <td>
              <img
                :src="node.icon.includes('http') ? node.icon : `data:image/png;base64,${node.icon}`"
                :alt="node.title"
              />
            </td>
            <td class="legend-content">
              <span class="legend-title">{{ node.title }}</span>
              <span class="legend-description" v-if="node.description">
                {{ node.description }}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Legend } from './types'

defineProps<{
  data: Legend | null
}>()
</script>

<style lang="scss" scoped>
.legend-table {
  margin: 0;
  border-spacing: 0;
  td {
    vertical-align: middle;
  }

  img {
    display: block;
  }
}

.legend-content {
  padding: .1em .5em;
}
.legend-title {
  display: block;
}
.legend-description {
  font-size: 0.85em;
}
</style>
