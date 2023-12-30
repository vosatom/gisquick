import centroid from '@turf/centroid'

import { BaseTransformer, type IBaseTransformer } from '../../base/transformer'
import type { AutocompleteResult } from '../../base/types'

export class WFSTransformer
  extends BaseTransformer
  implements IBaseTransformer
{
  transformAutocomplete(data: object, layers) {
    return {
      type: 'FeatureCollection',
      features: data.features.map((feature) => {
        const [layerName] = feature.id.split('.')
        const layer = layers[layerName]

        return {
          ...feature,
          properties: {
            type: 'wfs',
            title: feature.properties[layer.mainAttribute],
            layerName,
            id: feature.id,
            data: feature.properties,
            coordinate: feature.geometry
              ? centroid(feature.geometry).geometry.coordinates
              : null,
          },
        }
      }),
      raw: data,
    } as AutocompleteResult
  }
}
