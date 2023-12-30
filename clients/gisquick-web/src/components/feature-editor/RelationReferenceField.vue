<template>
  <div class="i-field text-field filled">
    <Autocomplete
      ref="autocompleteRef"
      :label="label"
      :items="items"
      :value="initialItem"
      :item-text="referencedValue"
      :item-value="referencedField"
      @text:update="onTextUpdate"
      @input="onInput"
      @open="onOpen"
      :placeholder="value === null ? '(empty)' : ''"
      :error="validationError || ''"
    >
      <template v-slot:item="{ html }">
        <div class="item f-row f-grow">
          <div class="f-grow">
            <span class="text" v-html="html[referencedValue]" />
          </div>
        </div>
      </template>

      <template v-slot:append="{ openPopup }">
        <svg
          class="toggle"
          width="11"
          height="11"
          viewBox="0 0 10 10"
          @click.stop="openPopup"
        >
          <path d="M 1,3 L 5,7 L 9,3" />
        </svg>
        <v-btn
          v-if="!disabled"
          class="clear icon flat"
          tabindex="-1"
          @click="setNull"
        >
          <v-icon name="delete" size="16" />
        </v-btn>
      </template>
    </Autocomplete>
  </div>
</template>

<script lang="js">
import { layerFeaturesQuery } from '@/map/featureinfo'
import Autocomplete from '@/ui/Autocomplete.vue'
import { useAsyncState, useThrottle } from '@vueuse/core'
import { ref, computed } from 'vue'
import $http from '@/client'
import { useStore } from '@/store/typed'

export default {
  name: 'RelationReferenceField',
  components: { Autocomplete },
  refs: ['autocompleteRef'],
  props: {
    disabled: Boolean,
    options: Object,
    attr: Object,
    relation: Object,
    referencedLayer: Object,
    label: String,
    value: [String, Number],
    validator: Function,
  },
  setup(props) {
    const project = useStore().state.project
    const inputValue = ref('')
    const freshItems = ref(true)
    const throttledInputValue = useThrottle(inputValue, 400)
    const referencedField = props.relation.referenced_fields?.[0] ?? 'id'
    const referencedValue = 'name'

    async function fetchRelation() {
      if (props.value === null || typeof props.value === 'undefined') {
        return null
      }

      const params = {
        VERSION: '1.1.0',
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON',
        MAXFEATURES: 1,
        FEATUREID: `${props.referencedLayer.name}.${props.value}`,
        PROPERTYNAME: [referencedField, referencedValue].join(','),
      }
      const headers = { 'Content-Type': 'text/xml' }
      const { data } = await $http.get(project.config.ows_url, {
        params,
        headers,
      })

      return data.features.map((item) => item.properties)?.[0]
    }

    async function fetchRelationsData() {
      const query = layerFeaturesQuery(
        props.referencedLayer,
        null,
        [
          {
            attribute: referencedValue,
            operator: 'LIKE',
            value: inputValue.value,
          },
        ],
        [referencedField, referencedValue],
      )

      const params = {
        VERSION: '1.1.0',
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON',
        MAXFEATURES: 100,
      }
      const headers = { 'Content-Type': 'text/xml' }
      const { data } = await $http.post(project.config.ows_url, query, {
        params,
        headers,
      })

      return data.features.map((item) => item.properties)
    }

    const {
      state: initialItem,
      execute: executeInitial,
      isLoading: isInitialLoading,
    } = useAsyncState(fetchRelation, [], {
      immediate: true,
      resetOnExecute: false,
      onSuccess: () => {
        inputValue.value = initialItem.value[referencedValue]
      },
    })

    const initial = []
    const {
      state: items,
      execute,
      isLoading,
    } = useAsyncState(fetchRelationsData, initial, {
      immediate: false,
      resetOnExecute: false,
      onSuccess: () => {
        freshItems.value = false
      },
    })
    return {
      items,
      initialItem,
      execute,
      executeInitial,
      inputValue,
      throttledInputValue,

      referencedField,
      referencedValue,
      freshItems,

      isLoading: computed(() => isInitialLoading.value || isLoading.value),
    }
  },
  computed: {
    validationError () {
      return this.validator ? this.validator(this.value) : ''
    }
  },
  watch: {
    throttledInputValue: {
      handler: async function () {
        if (this.$refs.autocompleteRef.open) {
          this.execute()
        }
      },
    },
    value: {
      handler: async function () {
        this.freshItems = true
        this.executeInitial()
      },
    },
  },
  methods: {
    onInput(value) {
      this.$emit('input', value)
    },
    onTextUpdate(value) {
      this.inputValue = value
    },
    onOpen() {
      if (this.freshItems) {
        this.execute()
      }
    },
    setNull() {
      this.$emit('input', null)
    },
  },
}
</script>

<style lang="scss" scoped>
.toolbar {
  ::v-deep .btn.icon {
    margin: 3px 2px;
    width: 26px;
    height: 26px;
  }
}

.notification {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.2);

  svg {
    border: 1px solid currentColor;
    border-radius: 50%;
    // color: var(--icon-color);
  }

  .content {
    width: 150px;
    font-size: 14px;
    border-radius: 3px;
    margin: 6px;
    background-color: #444;
    color: #fff;
    transition: 0.4s ease;

    &.error {
      background-color: var(--color-red);
    }
  }
}
</style>
