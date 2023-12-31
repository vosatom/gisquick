<template>
  <scroll-area>
    <div class="content px-2">
      <div
        v-for="infoPanelItem in infoPanelItems"
        :key="infoPanelItem.key"
        :class="{
          'sidebar-component': true,
          [`sidebar-component-${infoPanelItem.key}`]: true,
        }"
      >
        <component
          :is="infoPanelItem.component"
          :isVisible="isVisible"
          v-bind="infoPanelItem.props"
        />
      </div>
    </div>
  </scroll-area>
</template>

<script lang="js">
export default {
  props: { isVisible: Boolean, infoPanelItems: Array },
}
</script>

<style scoped>
.content :deep(a) {
  color: var(--color-primary);
}

.content :deep(a):active {
  background-color: rgba(17, 17, 17, 0.15);
  border-radius: 3px;
}

.sidebar-component {
  padding: 10px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
.sidebar-component:first-child,
.sidebar-component-description {
  border-top: 0;
}
</style>
