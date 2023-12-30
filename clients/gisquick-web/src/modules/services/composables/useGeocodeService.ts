import {
  watchDebounced,
  type MaybeRef,
  toValue,
  type MaybeRefOrGetter,
} from '@vueuse/core'
import { toLonLat } from 'ol/proj'

import type { ServiceOptions } from './serviceTypes'
import { handleRequest } from './util'
import type { BaseService } from '../base/service'

import type { QueryPoint } from '@/modules/routing/store'

interface UpdateItem {
  id: string
  result: any
}

export function useGeocodeService(
  provider: MaybeRef<BaseService>,
  query: { texts: MaybeRefOrGetter<QueryPoint[]> },
  options: ServiceOptions<UpdateItem[]> & {
    userProjection?: string
  } = { initialData: [] },
) {
  const handler = handleRequest(
    'reverseGeocode',
    provider,
    options,
    async (loader) => {
      if (!loader.reverseGeocode) return
      const texts = toValue(query.texts)

      const toUpdate: UpdateItem[] = []
      for (let i = 0; i < texts.length; i++) {
        const result = await loader.reverseGeocode({
          point: toLonLat(
            texts[i].geometry.coordinates,
            options.userProjection,
          ),
        })

        toUpdate.push({ id: texts[i].properties.id, result })
      }

      return toUpdate
    },
  )

  watchDebounced([provider, query.texts], handler.refetch, {
    debounce: options.debounce ?? 400,
    immediate: true,
  })

  return handler
}
