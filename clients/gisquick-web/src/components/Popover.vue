<template>
  <div
    class="menu"
    role="button"
    aria-haspopup="true"
    :aria-owns="menuId"
    :aria-expanded="open ? 'true' : 'false'"
  >
    <slot
      name="activator"
      :is-open="open"
      :open="openMenu"
      :toggle="toggleMenu"
    />
    <popup-content
      backhandler
      persistent
      type="menu"
      :transition="transition"
      :open.sync="open"
      :bounds="bounds"
      :backdrop="backdrop"
      :align="align"
      :arrow-style="arrowStyle"
      :popup-class="contentClass"
      :popup-style="popupStyle"
      :tabindex="items ? 0 : -1"
      @click:in="onClick"
      @click:out="popupClick"
      @keydown="keyHandler"
      @opened="onOpened"
      @closed="$emit('closed')"
    >
      <!-- <slot name="menu-prepend"/> -->
      <slot
        name="content"
        :is-open="open"
        :close="closeMenu"
        :id="menuId"
      >
      </slot>
    </popup-content>
  </div>
</template>

<script lang="js">
import pickBy from 'lodash/pickBy'
import PopupContent from '@/ui/PopupContent.vue'
import { elementBounds } from '@/ui/utils/popup'
import growTransition from '@/ui/transitions/grow'

let menuCounter = 0

export default {
  components: { PopupContent },
  props: {
    align: String,
    arrowStyle: Boolean,
    backdrop: Boolean,
    closeOnClick: Boolean,
    contentClass: {
      type: String,
      default: 'popup-menu light'
    },
    items: Array,
    transition: {
      type: [String, Object],
      // default: 'fade'
      default: () => growTransition()
    },
    expanded: null
  },
  data () {
    return {
      open: false,
      bounds: null,
      menuId: null
    }
  },
  computed: {
    popupStyle () {
      return this.bounds && { minWidth: this.bounds.width + 'px' }
    },
    itemsSlots () {
      // filter and rename items slots to match ActionList slots
      // const slots = {}
      // Object.keys(this.$scopedSlots).forEach(name => {
      //   if (name === 'item' || name.startsWith('item-')) {
      //     slots[name.replace('menu-', '')] = name

      //   }
      // })
      // return slots
      return pickBy(this.$scopedSlots, (_, name) => name.startsWith('item'))
    }
  },
  created () {
    this.menuId = `menu-${menuCounter++}`
  },
  methods: {
    openMenu () {
      this.bounds = elementBounds(this.$el.firstElementChild)
      this.open = true
    },
    closeMenu () {
      this.open = false
    },
    toggleMenu () {
      this.open ? this.closeMenu() : this.openMenu()
    },
    popupClick (e) {
      if (!this.$el.contains(e.target)) {
        this.closeMenu()
      }
    },
    onClick () {
      if (this.closeOnClick) {
        this.closeMenu()
      }
    },
    onOpened (e) {
      e.target.focus()
      this.$emit('opened')
    },
    onConfirm (item) {
      this.$emit('confirm', item)
      this.closeMenu()
    },
    keyHandler (e) {
      if ((e.key === 'Tab' && this.items) || e.key === 'Escape') {
        e.preventDefault()
        this.closeMenu()
        this.$el.children[0].focus() // focus activator
        // this.$children[0].$el.focus()
      }
    }
  }
}
</script>
