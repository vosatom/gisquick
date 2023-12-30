import type {
  AutocompletePayload,
  AutocompleteProperties,
  ReverseGeocodePayload,
  ReverseGeocodeProperties,
} from './types'
import { BaseTransformer, type IBaseTransformer } from '../../base/transformer'
import type { AutocompleteResult, ReverseGeocodeResult } from '../../base/types'

export class GeoapifyTransformer
  extends BaseTransformer
  implements IBaseTransformer
{
  transformAutocomplete(
    data: AutocompletePayload,
  ): AutocompleteResult<AutocompletePayload, AutocompleteProperties> {
    return {
      type: 'FeatureCollection',
      features: data.features.map((feature) => {
        return {
          type: feature.type,
          geometry: feature.geometry,
          properties: {
            id: feature.properties.place_id,
            title: feature.properties.formatted,
            type: feature.properties.result_type,
            coordinate: [feature.properties.lon, feature.properties.lat],
            data: feature.properties,
          },
        }
      }),
      raw: data,
    }
  }

  transformReverseGeocode(
    data: ReverseGeocodePayload,
  ): ReverseGeocodeResult<ReverseGeocodePayload, ReverseGeocodeProperties> {
    return {
      type: 'FeatureCollection',
      features: data.features.map((feature) => {
        return {
          ...feature,
          properties: {
            formatted: feature.properties.formatted,
            data: feature.properties,
          },
        }
      }),
      raw: data,
    }
  }
}
