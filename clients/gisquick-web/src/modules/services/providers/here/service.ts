import { HereTransformer } from './transformer'
import type { AutocompletePayload } from './types'
import { BaseService, type ServiceDefaults } from '../../base/service'
import type { AutocompleteLookupResult } from '../../base/types'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://developer.here.com/documentation
 */
class HereService extends BaseService {
  transformer = new HereTransformer()

  static defaults: ServiceDefaults = {
    service: {
      key: '',
      locale: 'en',
    },
    autocomplete: {
      limit: 5,
      baseUrl: 'https://autosuggest.search.hereapi.com/v1',
    },
    autocompleteLookup: {
      baseUrl: 'https://lookup.search.hereapi.com/v1',
    },
    reverseGeocode: {
      baseUrl: 'https://revgeocode.search.hereapi.com/v1',
    },
  }
}

HereService.buildMethods(HereService, {
  async autocomplete(options) {
    const { baseUrl, key, center, limit, locale, query } = this.mergeOptions(
      'autocomplete',
      options,
    )

    center?.reverse()

    // Autosuggest API returns results with position
    const url = stringifyUrl({
      url: `${baseUrl}/autosuggest`,
      query: {
        apiKey: key,
        limit,
        language: locale,
        at: center?.join(','),
        q: query,
      },
    })

    const response = await this.get<AutocompletePayload>(url)
    return this.transformer.transformAutocomplete(response.data)
  },

  async autocompleteLookup(options) {
    const { baseUrl, key, id, autocompleteResults } = this.mergeOptions(
      'autocompleteLookup',
      options,
    )

    const properties: Partial<AutocompleteLookupResult['properties']> = {
      id,
      title: '',
      type: '',
      coordinate: undefined,
      data: undefined,
    }
    const feature: AutocompleteLookupResult = {
      type: 'Feature',
      geometry: undefined,
      bbox: undefined,
      id,
      properties,
    }

    // Try to take posititon from previous autocomplete result - undocumented
    const entry = autocompleteResults?.features.find((e) => e.id === id)
    if (entry) {
      feature.bbox = entry.bbox
      properties.coordinate = entry.properties.coordinate
      properties.title = entry.properties.title
      properties.data = entry.properties.data
      properties.type = entry.properties.type
    }

    if (!properties.coordinate) {
      const url = stringifyUrl({
        url: `${baseUrl}/lookup`,
        query: { apiKey: key, id },
      })

      const response = await this.get(url)
      const data = response.data
      if (data) {
        feature.bbox = data.mapView
          ? [
              data.mapView.west,
              data.mapView.south,
              data.mapView.east,
              data.mapView.north,
            ]
          : undefined
        properties.coordinate = [data.position.lng, data.position.lat]
        properties.title = data.address.label
        properties.data = data
        properties.type = data.resultType
      }
    }

    if (!properties.coordinate) {
      throw new Error(`Cannot lookup ${id}`)
    }

    feature.geometry = {
      type: 'Point',
      coordinates: properties.coordinate,
    }

    return feature
  },

  async reverseGeocode(options) {
    const { baseUrl, key, point, locale } = this.mergeOptions(
      'reverseGeocode',
      options,
    )

    point?.reverse()

    const url = stringifyUrl({
      url: `${baseUrl}/revgeocode`,
      query: {
        apiKey: key,
        at: point.join(','),
        lang: locale,
      },
    })

    const response = await this.get(url)
    return this.transformer.transformReverseGeocode(response.data)
  },
})

export default HereService
