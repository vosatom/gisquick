import { format } from 'date-fns'

import type { Fields, Layer, Operation, ResolvedFields } from './types'

// Moved from NewFeatureEditor
export async function resolveFields(
  operation: Operation,
  layer: Layer,
  fields: Fields,
  { username }: { username: string },
) {
  const resolvedFields: ResolvedFields = {}
  for (const name in fields) {
    let value = fields[name]

    if (typeof value === 'function') {
      value = await value()
    }
    resolvedFields[name] = value
  }

  layer.attributes
    ?.filter((a) => a.widget === 'Autofill')
    .forEach((a) => {
      if (a.config && a.config.operations?.includes(operation)) {
        let value
        if (a.config.value === 'user') {
          value = username
        } else if (a.config.value === 'current_datetime') {
          value = new Date().toISOString()
        } else if (a.config.value === 'current_date') {
          value = format(new Date(), a.config?.field_format || 'yyyy-MM-dd')
        } else {
          return
        }
        resolvedFields[a.name] = value
      }
    })
  return resolvedFields
}
