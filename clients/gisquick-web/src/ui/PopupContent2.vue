<template>
  <portal :to="portal">
    <div
      ref="floating"
      class="floating-element"
      :class="popupClass"
      v-if="open"
      :style="floatingStyles"
    >
      <document-listener
        v-if="interactive"
        stacked
        :key="_uid"
        :src="origin"
        @click="onDocumentClick"
        @keydown="$emit('keydown', $event)"
      />
      <slot />
    </div>
  </portal>
</template>

<script>
import { ref } from 'vue'
import DocumentListener from './DocumentListener'
import { useFloating, flip, offset, autoUpdate, size } from '@floating-ui/vue'

export default {
  components: { DocumentListener },
  props: {
    align: String,
    arrowStyle: Boolean,
    backdrop: Boolean,
    backdropClass: [String, Array, Object],
    backhandler: Boolean,
    bounds: Object,
    interactive: {
      type: Boolean,
      default: true,
    },
    origin: String,
    open: {
      type: Boolean,
      default: undefined,
    },
    popupClass: {
      type: [String, Array, Object],
      default: 'light',
    },
    popupStyle: [Object, String],
    portal: {
      type: String,
      default: 'popup',
    },
    tabindex: [Number, String],
    transition: {
      type: [String, Object],
      default: 'fade',
    },
    type: String,
    persistent: Boolean,
  },
  setup(props) {
    const reference = ref()
    const floating = ref()
    const middleware = [
      flip(),
      offset({ mainAxis: 5 }),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.firstElementChild.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          })
        },
      }),
    ]

    const { floatingStyles } = useFloating(reference, floating, {
      middleware,
      whileElementsMounted: autoUpdate,
      placement: 'bottom-start',
    })
    return { floatingStyles, reference, floating }
  },
  updated() {
    this.reference = this.$el.parentElement
  },
  destroyed() {
    this.$emit('update:open', false)
  },
  methods: {
    onDocumentClick(e) {
      if (e.clientX < 0 || e.clientY < 0 || e.clientY > window.innerHeight) {
        return
      }
      if (!this.floating || !this.floating.contains(e.target)) {
        this.$emit('click:out', e)
      }
    },
  },
}
</script>

<style>
.floating-element {
  position: absolute;
  z-index: 2;
  pointer-events: all;
}
/* 
.floating-element {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.451);
} */

/* .reference-element {
  display: inline-block;
  background: red;
} */
</style>
