import { watchDebounced, type MaybeRef } from '@vueuse/core'
import type { Coordinate } from 'ol/coordinate'
import { toLonLat } from 'ol/proj'
import { unref } from 'vue'

import type { ServiceOptions } from './serviceTypes'
import { handleRequest } from './util'
import type { BaseService } from '../base/service'
import type { IsolineResult } from '../base/types'

export function useIsolineService(
  provider: MaybeRef<BaseService | undefined>,
  query: { point: MaybeRef<Coordinate>; profile: MaybeRef<string> },
  options: ServiceOptions<IsolineResult> = {},
) {
  const handler = handleRequest(
    'isoline',
    provider,
    options,
    async (_provider) => {
      const point = unref(query.point)
      if (!point) return
      return await _provider.isoline({
        point: toLonLat(point),
        profile: unref(query.profile),
      })
    },
  )

  watchDebounced(
    [provider, query.point, query.profile, options.isEnabled],
    handler.refetch,
    {
      debounce: options.debounce ?? 200,
      // @ts-expect-error - wrong ts types
      immediate: true,
    },
  )

  return handler
}
