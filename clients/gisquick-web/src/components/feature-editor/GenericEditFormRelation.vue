<template>
  <div>
    <GenericEditForm
      :layer="layer"
      :initial="initialData"
      :fields="data"
      :project="project.config"
      :attributeKeys="['photo', 'name', 'desc']"
    />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

import GenericEditForm from './GenericEditForm.vue'

export default {
  props: ['layer', 'data', 'initialData'],
  components: { GenericEditForm },

  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(data, old) {
        // Let parent component know, if the data in relation has changed from GenericEditForm
        // GenericEditForm mutates data, so if the reference does not equal it has to be from outside
        if (data === old) {
          this.$emit('input', data)
        }
      },
    },
  },

  computed: {
    ...mapState(['project']),
  },
}
</script>
