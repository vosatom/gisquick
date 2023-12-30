import { tryOnScopeDispose, type MaybeRef } from '@vueuse/core'
import type { Object } from 'ol'
import { ref, type Ref } from 'vue'

export function useObservable<Value>(object: Object, key: string): Ref<Value> {
  const getter = () => object.get(key)
  const center = ref(getter())

  function centerChange() {
    center.value = getter()
  }

  object.on(`change:${key}` as unknown as any, centerChange)

  tryOnScopeDispose(() => {
    object.un(`change:${key}` as unknown as any, centerChange)
  })

  return center
}
