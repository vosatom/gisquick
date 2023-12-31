<template>
  <input-field
    class="autocomplete"
    :class="{focused}"
    :error="error"
    :label="label"
    :color="color"
    :disabled="disabled"
    aria-haspopup="true"
    :aria-disabled="disabled"
    :aria-expanded="showPopup ? 'true' : 'false'"
    role="combobox"
  >
    <div class="input f-row-ac" tabindex="-1" @click="focusInput">
      <slot name="prepend"/>
      <input
        ref="input"
        :placeholder="placeholder"
        autocomplete="off"
        :disabled="disabled"
        :value="text"
        v-on="proxyListeners"
        @click="openPopup"
        @blur="onTextfieldBlur"
        @input="updateText"
      />
      <slot name="append" :openPopup="openPopup"/>
    </div>
    <popup-content
      backhandler
      :align="align"
      :transition="transition"
      :open="showPopup"
      :bounds="bounds"
      :popup-class="contentClass"
      :popup-style="popupStyle"
      @update:open="open = $event"
      @click:out="popupClick"
      @click:in="closePopup"
      @keydown.esc="closePopup"
      @keydown.tab.prevent="closePopup"
      @keydown.up.prevent="highlight(highlightIndex - 1)"
      @keydown.down.prevent="highlight(highlightIndex + 1)"
      @keydown.home.prevent="highlight(0)"
      @keydown.end.prevent="highlight(displayedItems.length)"
      @keydown.enter="onEnter"
      @closed="onClosed"
      @opened="popupOpened"
      tabindex="-1"
    >
      <div
        v-if="items && items.length > 0"
        ref="popup"
        tabindex="-1"
        role="listbox"
        class="popup-content popup-list"
        :style="colorVars"
      >
        <template>
          <div
            v-for="(item, index) in renderItems"
            :key="index"
            ref="item"
            tabindex="0"
            class="item"
            role="option"
            :class="{
              highlighted: highlightIndex === index
            }"
            @click="selectItem(item)"
            @mouseover="highlightIndex = index"
          >
            <slot v-if="item === appendItem" name="append-item"/>
            <slot
              v-else
              name="item"
              :item="item"
              :index="index"
              :html="highlights[index] || {}"
            >
              <span v-if="highlights[index]" v-html="highlights[index][itemText]"/>
            </slot>
          </div>
        </template>
      </div>
    </popup-content>
  </input-field>
</template>

<script lang="js">
import clamp from 'lodash/clamp'
import pick from 'lodash/pick'
import PopupContent from './PopupContent2.vue'
import InputField from './InputField.vue'
import { elementBounds } from './utils/popup'
import { colorVars } from './utils/colors'

import { sanitize, escapeRegExp, removeDiacritics } from './utils/text'
import get from 'lodash/get'

function _highlight (orig, search, re) {
  const m = re.exec(search)
  if (m) {
    const s = m.index
    const e = s + m[0].length
    return orig.substring(0, s) + `<strong>${orig.substring(s, e)}</strong>` + _highlight(orig.substring(e), search.substring(e), re)
  }
  return orig
}

export function highlight (text, query) {
  text = sanitize(text)
  if (query.length === 0) {
    return text
  }
  const searchText = sanitize(removeDiacritics(text))
  const re = new RegExp(escapeRegExp(removeDiacritics(query)), 'i')
  return _highlight(text, searchText, re)
}

export default {
  components: { PopupContent, InputField },
  props: {
    align: String,
    color: {
      type: String,
      default: 'primary'
    },
    icon: {
      type: String,
      default: 'search'
    },
    error: String,
    label: String,
    value: {},
    disabled: Boolean,
    transition: {
      type: [String, Object],
      default: 'slide-y'
    },
    placeholder: String,
    items: Array,
    itemText: {
      type: String,
      default: 'text'
    },
    /**
     * Comma separated list of fields
     */
    highlightFields: String,
    itemValue: String,
    minChars: {
      type: Number,
      default: 0
    },
    multi: Boolean,
    contentClass: {
      type: String,
      default: 'popup-autocomplete'
    },
    uniformWidth: Boolean,
    filterItems: Boolean,
  },
  data () {
    return {
      text: '',
      open: false,
      highlightIndex: -1
    }
  },
  computed: {
    focused () {
      const activeEl = this.$ui.activeEl
      return this.$el && (this.$el.contains(activeEl) || this.$ui.isLinked(activeEl, this.$el))
    },
    proxyListeners () {
      return pick(this.$listeners, ['focus', 'click', 'keydown'])
    },
    colorVars () {
      return colorVars(this.color)
    },
    showPopup () {
      return !!(this.open && this.text?.length >= this.minChars && this.items?.length)
    },
    bounds () {
      return this.showPopup ? elementBounds(this.$el) : null
    },
    popupStyle () {
      const style = { ...this.colorVars }
      if (this.bounds) {
        const width = this.bounds.width + 'px'
        style.minWidth = width
        if (this.uniformWidth) {
          style.width = width
        }
      }
      return style
    },
    regex () {
      // return this.text && new RegExp(escapeRegExp(this.text), 'i')
      return this.text && new RegExp(escapeRegExp(sanitize(removeDiacritics(this.text))), 'i')
    },
    displayedItems () {
      if (!this.filterItems) {
        return this.items
      }
      if (!this.text) {
        return this.items
      }
      // filter only matched items (with highlight)
      // return this.items.filter(i => i[this.itemText].match(this.regex))
      return this.items.filter(i => this.regex.test(removeDiacritics(i[this.itemText])))
    },
    renderItems () {
      return this.appendItem ? this.displayedItems.concat(this.appendItem) : this.displayedItems
    },
    highlights () {
      if (!this.text) {
        return []
      }
      const fields = this.highlightFields?.split(',') || [this.itemText]
      return this.displayedItems.map(item => {
        return fields.reduce((obj, field) => {
          const text = get(item, field)
          obj[field] = this.text.length > 1 ? highlight(text, this.text) : text
          return obj
        }, {})
      })
    },
    appendItem () {
      return this.$scopedSlots['append-item'] && {}
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (!v) {
          this.text = ''
        } else if (!this.multi) {
          this.text = v?.[this.itemText] || ''
        }
      }
    },
    focused (v) {
      if (!v) {
        // console.log('Autocomplete:blur')
        // this.text = ''
        // this.onTextfieldBlur()
      }
    }
  },
  methods: {
    cleanup () {
      if (!this.text && !this.multi && this.value) {
        this.$emit('input', null)
      }
      if (!this.multi && this.text) {
        this.text = this.value?.[this.itemText] || ''
      }
    },
    onTextfieldBlur (e) {
      // console.log('onTextfieldBlur')
      return
      if (!this.showPopup || !this.value) {
        this.cleanup()
        this.$emit('blur', e)
      }
    },
    onInput (item) {
      let value = this.itemValue ? get(item, this.itemValue) : item
      if (this.multi) {
        value = Array.isArray(this.value) ? [...this.value, value] : [value]
      }
      this.$emit('input', value)
    },
    selectItem (item) {
      if (item === this.appendItem) {
        this.$emit('append-item:click')
      } else {
        this.onInput(item)
      }
      if (this.multi) {
        this.text = ''
      } else {
        this.text = item?.[this.itemText] || ''
      }
      this.$emit('text:update', this.text)
      this.focusInput()
    },
    updateText (e) {
      const text = e.target.value
      this.text = text
      this.open = true
      this.$emit('text:update', this.text)
    },
    updateTextSilent (text) {
      this.text = text
    },
    openPopup () {
      this.open = true
      this.$emit('open')
      // this.$refs.textField.focus()
    },
    closePopup () {
      this.open = false
      this.$emit('close')
    },
    popupClick (e) {
      if (!this.$el.contains(e.target)) {
        this.closePopup()
      }
    },
    focusInput () {
      if (!this.disabled) {
        // this.$el.querySelector('[tabindex]').focus()
        this.$refs.input?.focus()
      }
    },
    highlight (index) {
      this.highlightIndex = clamp(index, -1, this.renderItems.length - 1)
      const el = this.$refs.item && this.$refs.item[this.highlightIndex]
      el && el.scrollIntoView({ block: 'nearest' })
    },
    onEnter (e) {
      if (this.highlightIndex !== -1) {
        this.selectItem(this.renderItems[this.highlightIndex])
        this.closePopup()
      } else {
        this.$emit('enter', e)
      }
    },
    clear () {
      this.text = ''
      if (!this.multi) {
        this.$emit('input', null)
      }
      this.$emit('clear')
    },
    removeItem (item) {
      const value = this.value.filter(i => i !== item)
      this.$emit('input', value)
    },
    onClosed () {
      return
      this.highlightIndex = -1
      if (!this.$refs.textField?.focused) {
        this.cleanup()
        this.$emit('blur')
      }
      this.$emit('closed')
    },
    popupOpened (e) {
      console.log('popupOpened', e.target)
    },
  }
}
</script>

<style lang="scss" scoped>
.autocomplete {
  input {
    outline: none;
    border: none;
    flex-grow: 1;
    font-size: 15px;
    background: transparent;
  }
}
.popup-list {
  .item {
    outline: none;
    border: 1px solid;
    border-color: transparent;
    transition: all .3s cubic-bezier(.25,.8,.25,1);
    &.highlighted {
      border-color: var(--color);
      background-color: rgba(var(--color-rgb), 0.04);
    }
  }
}
</style>
