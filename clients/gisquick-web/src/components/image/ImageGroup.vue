<template>
  <div :class="{ error }" v-if="src.length > 0">
    <slot :open-viewer="openViewer">
      <slot v-if="error" name="error">
        <broken-photo-svg class="image-error p-2" fill="var(--color-red)" />
      </slot>

      <template v-if="!error">
        <template v-if="gallery">
          <img
            v-if="!error"
            :alt="alt[currentIndex]"
            :src="currentSrc"
            v-bind="$attrs"
            @error="onError"
            @load="onLoad"
            @click="openViewer"
          />
        </template>
        <template v-else>
          <img
            v-for="(_, index) in src"
            :key="index"
            :alt="alt[index]"
            :src="thumbnail[index] || src[index]"
            v-bind="$attrs"
            @click="openViewer"
          />
        </template>
      </template>
    </slot>
    <v-dialog
      content-class="fullscreen f-col"
      :value="isViewerOpen && currentIndex !== null"
      @close="isViewerOpen = false"
    >
      <template v-slot:header>
        <span />
      </template>

      <DocumentListener
        @keydown.left="updateBy(-1)"
        @keydown.right="updateBy(1)"
      />
      <image-viewer class="f-grow" :src="src[currentIndex]">
        <template v-slot:default="{ viewer }">
          <div class="toolbar f-row-ac">
            <div v-if="alt[currentIndex]">{{ alt[currentIndex] }}</div>

            <v-btn
              class="icon small"
              @click="updateBy(-1)"
              :disabled="!cycle && currentIndex === 0"
              v-if="src.length > 1"
            >
              <v-icon name="arrow-left" />
            </v-btn>
            <v-btn
              class="icon small"
              @click="updateBy(1)"
              :disabled="!cycle && currentIndex === src.length - 1"
              v-if="src.length > 1"
            >
              <v-icon name="arrow-right" />
            </v-btn>
            <div class="px-2" v-if="src.length > 1">
              {{ currentIndex + 1 }} / {{ src.length }}
            </div>
            <v-btn class="icon small" @click="viewer.resetView">
              <v-icon name="magnifier" />
            </v-btn>
            <span>{{ Math.round(viewer.zoom * 100) }}%</span>
            <v-btn class="icon small" @click="download">
              <v-icon name="download" />
            </v-btn>
            <v-btn class="icon small" @click="isViewerOpen = false">
              <v-icon name="x" />
            </v-btn>
          </div>
        </template>
      </image-viewer>
    </v-dialog>

    <div class="f-row-ac f-justify-center" v-if="gallery && src.length > 1">
      <v-btn
        class="icon small"
        @click="updateBy(-1)"
        :disabled="!cycle && currentIndex === 0"
        v-if="src.length > 1"
      >
        <v-icon name="arrow-left" />
      </v-btn>
      {{ currentIndex + 1 }} / {{ src.length }}
      <v-btn
        class="icon small"
        @click="updateBy(1)"
        :disabled="!cycle && currentIndex === src.length - 1"
        v-if="src.length > 1"
      >
        <v-icon name="arrow-right" />
      </v-btn>
    </div>
  </div>
</template>

<script lang="js">
import FileSaver from 'file-saver'
import ImageViewer from './ImageViewer.vue'
import BrokenPhotoSvg from '@/assets/photo-broken.svg?component'
import DocumentListener from '@/ui/DocumentListener'

export default {
  components: { ImageViewer, BrokenPhotoSvg, DocumentListener },
  inheritAttrs: false,
  props: {
    alt: Array,
    src: Array,
    thumbnail: Array,
    gallery: Boolean,
    cycle: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      currentIndex: 0,
      isViewerOpen: false,
      error: false,
    }
  },
  computed: {
    currentSrc() {
      return this.thumbnail[this.currentIndex] || this.src[this.currentIndex]
    },
  },
  watch: {
    currentSrc: {
      handler() {
        this.loading = true
        this.error = false
      },
      immediate: true,
    },
  },
  methods: {
    onError(e) {
      this.error = true
      this.loading = false
      this.$emit('error', e)
    },
    onLoad(e) {
      this.loading = false
      this.$emit('load', e)
    },
    download() {
      FileSaver.saveAs(this.src[this.currentIndex])
    },
    openViewer() {
      this.isViewerOpen = true
    },
    updateBy(delta) {
      let newIndex = this.currentIndex + delta
      const lastIndex = this.src.length - 1
      if (this.cycle) {
        if (newIndex < 0) {
          newIndex = lastIndex
        } else if (newIndex > lastIndex) {
          newIndex = 0
        }
      } else {
        newIndex = Math.min(Math.max(newIndex, 0), lastIndex)
      }
      this.currentIndex = newIndex
    },
  },
}
</script>

<style lang="scss" scoped>
.toolbar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  --icon-color: #fff;
  color: #fff;
  background-color: rgba(#333, 0.5);
  user-select: none;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-in;
}
</style>
