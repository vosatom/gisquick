import { GeoapifyTransformer } from './transformer'
import type {
  AutocompleteParams,
  AutocompletePayload,
  ReverseGeocodePayload,
} from './types'
import { BaseService, type ServiceDefaults } from '../../base/service'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://apidocs.geoapify.com
 */
class GeoapifyService extends BaseService {
  transformer = new GeoapifyTransformer()

  static defaults: ServiceDefaults = {
    service: {
      key: '',
      baseUrl: 'https://api.geoapify.com/v1',
      locale: 'en',
    },
    reverseGeocode: {},
    autocomplete: {},
    autocompleteLookup: {},
  }
}

GeoapifyService.buildMethods(GeoapifyService, {
  async reverseGeocode(options) {
    const { point, baseUrl, key } = this.mergeOptions('reverseGeocode', options)

    const url = stringifyUrl({
      url: `${baseUrl}/geocode/reverse`,
      query: {
        apiKey: key,
        format: 'geojson',
        lon: point[0],
        lat: point[1],
      },
    })
    const response = await this.get<ReverseGeocodePayload>(url)
    return this.transformer.transformReverseGeocode(response.data)
  },

  async autocomplete(options) {
    const { baseUrl, key, center, locale, query, biasToMapView } =
      this.mergeOptions('autocomplete', options)

    const params: AutocompleteParams = {
      apiKey: key,
      lang: locale,
      text: query,
    }

    if (biasToMapView && center) {
      params.bias = `proximity:${center?.join(',')}`
    }

    const url = stringifyUrl({
      url: `${baseUrl}/geocode/autocomplete`,
      query: params,
    })

    const response = await this.get<AutocompletePayload>(url)
    return this.transformer.transformAutocomplete(response.data)
  },

  async autocompleteLookup(options) {
    const { id, autocompleteResults } = this.mergeOptions(
      'autocompleteLookup',
      options,
    )

    // Try to take posititon from previous autocomplete result - undocumented
    const entry = autocompleteResults?.features.find((e) => e.properties.id === id)
    if (!entry) {
      throw new Error(`Cannot lookup ${id}`)
    }

    return entry
  },
})

export default GeoapifyService
