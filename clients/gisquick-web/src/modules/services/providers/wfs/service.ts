import { WFSTransformer } from './transformer'
import { BaseService, type ServiceDefaults } from '../../base/service'
import { stringifyUrl } from '../../base/url'

import {
  OrOperator,
  formatLayerQuery,
  getFeatureQuery,
} from '@/map/featureinfo'

/**
 * Documentation at https://docs.qgis.org/3.28/en/docs/server_manual/services/wfs.html
 */
class WFSService extends BaseService {
  transformer = new WFSTransformer()

  static defaults: ServiceDefaults = {
    service: {
      baseUrl: '/',
    },
    autocomplete: {},
    autocompleteLookup: {},
  }
}

WFSService.buildMethods(WFSService, {
  async autocomplete(options) {
    const { baseUrl, layers, query } = this.mergeOptions(
      'autocomplete',
      options,
    )

    const url = stringifyUrl({
      url: `${baseUrl}`,
      query: {
        SERVICE: 'WFS',
        VERSION: '1.1.0',
        REQUEST: 'GetFeature',
        OUTPUTFORMAT: 'GeoJSON',
        MAXFEATURES: 10,
      },
    })

    if (!layers) {
      throw new Error('No layers to search')
    }

    const xmlQuery = getFeatureQuery(
      ...Object.entries(layers).map(([layerName, layer]) =>
        formatLayerQuery(
          { name: layerName },
          null,
          layer.attributes.map((attribute) => ({
            attribute,
            operator: 'LIKE',
            value: query,
          })),
          undefined,
          OrOperator,
        ),
      ),
    )

    const response = await this.post(url, xmlQuery, {
      headers: { 'Content-Type': 'text/xml' },
    })
    return this.transformer.transformAutocomplete(response.data, layers)
  },

  async autocompleteLookup(options) {
    const { id, autocompleteResults } = this.mergeOptions(
      'autocompleteLookup',
      options,
    )
    const entry = autocompleteResults.features?.find((e) => e.id === id)
    if (!entry) {
      throw new Error(`Cannot lookup ${id}`)
    }

    return entry
  },
})

export default WFSService
