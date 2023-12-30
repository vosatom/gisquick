import type { Coordinate } from 'ol/coordinate'

import type {
  AutocompleteLookupPayload,
  AutocompletePayload,
  ReverseGeocodePayload,
} from './types'
import { BaseTransformer } from '../../base/transformer'
import type { AutocompleteResult, ReverseGeocodeResult } from '../../base/types'

export class NominatimTransformer extends BaseTransformer {
  private getGeometry(feature: any, coordinates: Coordinate) {
    if (feature.geojson) return feature.geojson
    return { type: 'Point', coordinates }
  }

  transformAutocomplete(
    data: AutocompletePayload[],
  ): AutocompleteResult<AutocompletePayload[]> {
    return {
      type: 'FeatureCollection',
      features: data.map((feature) => {
        const coordinates = [parseFloat(feature.lon), parseFloat(feature.lat)]
        const bbox = [
          parseFloat(feature.boundingbox[2]),
          parseFloat(feature.boundingbox[0]),
          parseFloat(feature.boundingbox[3]),
          parseFloat(feature.boundingbox[1]),
        ]
        return {
          type: 'Feature',
          bbox,
          geometry: this.getGeometry(feature, coordinates),
          id: feature.place_id,
          properties: {
            id: feature.place_id,
            title: feature.display_name,
            type: feature.type,
            coordinate: coordinates,
            data: feature,
          },
        }
      }),
      raw: data,
    }
  }

  transformAutocompleteLookup(
    data: AutocompleteLookupPayload,
    results: AutocompleteResult,
  ) {
    const item = results.features.find((e) => e.id === data.place_id)

    return {
      type: 'Feature',
      bbox: item?.bbox,
      geometry: data.geometry,
      id: data.place_id,
      properties: {
        id: data.place_id,
        title: item?.properties.title ?? data.localname,
        type: data.type,
        coordinate: data.centroid.coordinates,
        data,
      },
    }
  }

  transformReverseGeocode(
    data: ReverseGeocodePayload,
  ): ReverseGeocodeResult<
    ReverseGeocodePayload,
    ReverseGeocodePayload['features'][number]
  > {
    return {
      type: 'FeatureCollection',
      features: data.features.map((feature) => {
        return {
          ...feature,
          properties: {
            formatted: feature.properties.display_name,
            data: feature.properties,
          },
        }
      }),
      raw: data,
    }
  }
}
