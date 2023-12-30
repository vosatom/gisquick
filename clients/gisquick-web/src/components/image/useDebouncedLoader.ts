import { refDebounced } from '@vueuse/core'
import { computed, type Ref } from 'vue'

export function useDebouncedLoader(
  isLoading: Ref<boolean>,
  delay: number = 300,
): Ref<boolean> {
  const debouncedLoading = refDebounced(isLoading, delay)
  return computed(() => {
    return isLoading.value && debouncedLoading.value
  })
}
