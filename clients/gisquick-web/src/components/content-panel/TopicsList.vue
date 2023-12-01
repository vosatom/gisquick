<template>
  <div
    class="layers-tree topics-list py-4"
  >
    <template v-for="(topic, index) in topics">
      <div class="f-col">
        <label
          :key="index"
          class="item layer"
          :class="{
            expanded: expandedItem === topic,
            active: activeTopicIndex === index,
            'px-4': true,
          }"
          :title="topic.title"
        >
          <div class="f-row-ac">
            <input
              type="radio"
              class="hidden"
              :checked="activeTopicIndex === index"
              @input="setTopic(index)"
            />

            <div class="f-grow text-ellipsis">{{ topic.title }}</div>
            <v-btn class="icon flat small" @click="toggleDetail(topic)">
              <v-icon class="toggle" name="arrow-down" size="12" />
              <!-- <v-icon
                class="toggle"
                name="arrow-down2"
                size="16"
              /> -->
            </v-btn>
          </div>

          <div
            @click="setTopic(index)"
            v-if="topic.thumbnail_url"
            class="topic-thumbnail"
          >
            <img :src="topic.thumbnail_url" :alt="topic.abstract" />
          </div>
        </label>
        <collapse-transition :key="`detail-${index}`">
          <div
            v-if="expandedItem === topic"
            class="metadata px-2 py-1"
          >
            <translate class="label">Abstract</translate>
            <span>{{ topic.abstract }}</span>
          </div>
        </collapse-transition>
      </div>
    </template>
  </div>
</template>

<script lang="js">
import { mapState, mapGetters } from 'vuex'
import difference from 'lodash/difference'

export default {
  data () {
    return {
      expandedItem: null
    }
  },
  computed: {
    ...mapState(['project']),
    ...mapGetters(['visibleBaseLayer']),
    hiddenLayers () {
      return this.project.overlays.list.filter(l => l.hidden).map(l => l.name)
    },
    topics () {
      return this.project.config.topics
      const { topics } = this.project.config
      return topics.map(t => ({
        ...t,
        visible_overlays: t.visible_overlays.filter(n => !this.hiddenLayers.includes(n))
      }))
    },
    activeTopic () {
      // this ignores layers in hidden groups
      const visibleLayers = this.project.overlays.list.filter(l => l.visible && !l.hidden).map(l => l.name)
      return this.topics.find(t => t.visible_overlays.length === visibleLayers.length && difference(t.visible_overlays, visibleLayers).length === 0 &&
          (!t.base_layer ||
            (t.base_layer && t.base_layer === this.visibleBaseLayer.name)),
      )
    },
    activeTopicIndex () {
      return this.topics.indexOf(this.activeTopic)
    }
  },
  methods: {
    toggleDetail (item) {
      this.expandedItem = this.expandedItem !== item ? item : null
    },
    setTopic (index) {
      const topic = this.topics[index]
      this.$store.commit('visibleLayers', topic.visible_overlays)
      this.$store.commit('visibleBaseLayer', topic.base_layer)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './layers-tree.scss';
.topic-thumbnail {
  cursor: pointer;
}

.topics-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(163px, 1fr));
}

.title {
  font-weight: bold;
}

.item {
  cursor: pointer;
  display: block;
}

.item.active {
  color: var(--color-primary);
  font-weight: bold;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
