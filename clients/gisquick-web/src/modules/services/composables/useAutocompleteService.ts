import { toValue, type MaybeRef } from '@vueuse/core'
import { watch } from 'vue'

import type { ServiceOptions } from './serviceTypes'
import { handleRequest } from './util'
import type { BaseAutocompleteRequest, BaseService } from '../base/service'
import type { AutocompleteResult } from '../base/types'

type Data = AutocompleteResult

export function useAutocompleteService(
  provider: MaybeRef<BaseService>,
  query: { query: MaybeRef<any>; center: MaybeRef<any>; extent: MaybeRef<any> },
  options?: ServiceOptions<Data>,
) {
  const handler = handleRequest(
    'autocomplete',
    provider,
    options,
    async (loader) => {
      const textQuery = toValue(query.query)
      if (!textQuery || !loader.autocomplete) return

      const params: BaseAutocompleteRequest = {
        query: textQuery,
        center: toValue(query.center),
        extent: toValue(query.extent),
      }
      return await loader.autocomplete(params)
    },
  )

  watch([provider, query.query, query.center, query.extent], handler.refetch)

  return handler
}
