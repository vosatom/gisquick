import { toValue, type MaybeRef } from '@vueuse/core'
import { computed } from 'vue'

import { getFeatureConfig } from '../util/getFeatureConfig'

import * as loaders from '@/modules/services'
import type { ServicesConfig } from '@/modules/services/base/configTypes'
import type { BaseService } from '@/modules/services/base/service'
import { useStore } from '@/store/typed'

export function useProvider(
  featureKey: keyof ServicesConfig['features'],
  selectedProvider?: MaybeRef<string>,
) {
  const store = useStore()
  const config = store.state.routing.config
  const featureConfig = getFeatureConfig(config, featureKey)
  const loader = computed(() => {
    let providerKey = selectedProvider
      ? toValue(selectedProvider)
      : featureConfig?.provider
    if (Array.isArray(providerKey)) {
      providerKey = providerKey[0]
    }

    const provider = config.providers[providerKey]
    if (!provider?.type || !(provider.type in loaders)) return
    const result = new loaders[provider.type]() as BaseService

    result.setGlobalParams(provider.settings)
    result.setFeatureParams(featureKey, featureConfig.settings)

    return result
  })

  return loader
}
