import type { AutocompletePayload, ReverseGeocodePayload } from './types'
import { BaseTransformer, type IBaseTransformer } from '../../base/transformer'
import type { AutocompleteResult, ReverseGeocodeResult } from '../../base/types'

export class HereTransformer
  extends BaseTransformer
  implements IBaseTransformer
{
  transformAutocomplete(data: AutocompletePayload) {
    return {
      type: 'FeatureCollection',
      features: data.items.map((feature) => {
        const coordinate = [feature.position.lng, feature.position.lat]
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coordinate },
          bbox: undefined,
          id: feature.id,
          properties: {
            id: feature.id,
            title: feature.title,
            type: feature.resultType,
            coordinate,
            data: feature,
          },
        }
      }),
      raw: data,
    } as AutocompleteResult
  }

  transformReverseGeocode(
    data: ReverseGeocodePayload,
  ): ReverseGeocodeResult<
    ReverseGeocodePayload,
    ReverseGeocodePayload['items'][number]
  > {
    return {
      type: 'FeatureCollection',
      features: data.items.map((item) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.position.lng, item.position.lat],
          },
          id: item.id,
          properties: {
            formatted: item.address?.label ?? item.title,
            data: item,
          },
        }
      }),
      raw: data,
    }
  }
}
