import { NominatimTransformer } from './transformer'
import type { AutocompleteLookupPayload, AutocompletePayload, ReverseGeocodePayload } from './types'
import { BaseService, type ServiceDefaults } from '../../base/service'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://nominatim.org/release-docs/develop/api/Overview/
 */
class NominatimService extends BaseService {
  transformer = new NominatimTransformer()

  static defaults: ServiceDefaults = {
    service: {
      baseUrl: 'https://nominatim.openstreetmap.org',
      locale: 'en',
    },
    autocomplete: {
      limit: 5,
    },
  }
}

NominatimService.buildMethods(NominatimService, {
  async autocomplete(options) {
    const { limit, locale, query, extent, baseUrl } = this.mergeOptions(
      'autocomplete',
      options,
    )

    const url = stringifyUrl({
      url: `${baseUrl}/search`,
      query: {
        polygon_geojson: 0,
        format: 'jsonv2',
        limit,
        viewbox: extent?.join(','),
        'accept-language': locale,
        q: query,
        bounded: 0,
      },
    })
    const response = await this.get<AutocompletePayload>(url)
    return this.transformer.transformAutocomplete(response.data)
  },

  async autocompleteLookup(options) {
    const { id, autocompleteResults, baseUrl, locale } =
      this.mergeOptions('autocompleteLookup', options)

    let entry

    const url = stringifyUrl({
      url: `${baseUrl}/details`,
      query: {
        polygon_geojson: 1,
        format: 'json',
        'accept-language': locale,
        place_id: id,
      },
    })
    const response = await this.get<AutocompleteLookupPayload>(url)
    if (response?.data) {
      entry = this.transformer.transformAutocompleteLookup(response.data, autocompleteResults)
    }

    if (!entry) {
      entry = autocompleteResults?.features.find((e) => e.id === id)
    }

    if (!entry) {
      throw new Error(`Cannot lookup ${id}`)
    }

    return entry
  },

  async reverseGeocode(options) {
    const { point, baseUrl } = this.mergeOptions('reverseGeocode', options)

    const url = stringifyUrl({
      url: `${baseUrl}/reverse`,
      query: {
        format: 'geojson',
        lon: point[0],
        lat: point[1],
      },
    })
    const response = await this.get<ReverseGeocodePayload>(url)
    return this.transformer.transformReverseGeocode(response.data)
  },
})

export default NominatimService
