import type { ServicesConfig } from '@/modules/services/base/configTypes'

export function getFeatureConfig<T extends keyof ServicesConfig['features']>(
  config: ServicesConfig,
  featureKey: T,
) {
  return config.features?.[featureKey] as NonNullable<ServicesConfig['features'][T]>
}
