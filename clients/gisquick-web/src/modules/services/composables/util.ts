import { toValue, type MaybeRefOrGetter } from '@vueuse/core'
import { CanceledError } from 'axios'
import { ref, shallowRef } from 'vue'

import type { ServiceError, ServiceOptions } from './serviceTypes'
import type { BaseService } from '../base/service'

export function handleRequest<Data>(
  key: string,
  provider: MaybeRefOrGetter<BaseService | undefined>,
  options: ServiceOptions<Data> = {},
  callback: (loader: BaseService, options: { signal: AbortSignal }) => Promise<Data | undefined>,
) {
  const isLoading = ref(false)
  const error = ref<ServiceError | undefined>(undefined)
  const data = shallowRef(options.initialData)
  let abortController: AbortController

  function abort() {
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()
    abortController.signal.addEventListener('abort', () => {
      isLoading.value = false
    })
  }

  async function refetch() {
    abort()

    const _loader = toValue(provider)
    if (!_loader || !_loader[key] || toValue(options.isEnabled) === false)
      return

    try {
      error.value = undefined
      isLoading.value = true
      const result = await callback(_loader, { signal: abortController.signal })
      isLoading.value = false
      data.value = result
      if (options.onSuccess) options.onSuccess(result)
      return result
    } catch (err) {
      isLoading.value = false
      if (err instanceof CanceledError)  {
        return
      }
      data.value = undefined
      console.error(err)
      error.value = err as ServiceError
      if (options.onError) options.onError(err as ServiceError)
    }
  }

  return {
    loader: provider,
    isLoading,
    data,
    error,
    refetch,
  }
}
