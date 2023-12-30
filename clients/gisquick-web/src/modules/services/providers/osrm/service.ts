import { OSRMTransformer } from './transformer'
import { BaseService, type ServiceDefaults } from '../../base/service'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://project-osrm.org/docs/v5.24.0/api
 */
class OSRMService extends BaseService {
  transformer = new OSRMTransformer()

  static defaults: ServiceDefaults = {
    service: {
      baseUrl: 'https://routing.openstreetmap.de',
    },
  }
}

OSRMService.buildMethods(OSRMService, {
  async route(options) {
    const { points, baseUrl, alternatives, instructions, profile } =
      this.mergeOptions('route', options)

    const coords = points.map((p) => p.join(',')).join(';')
    const params = {
      overview: instructions ? false : 'simplified',
      alternatives,
      steps: instructions,
    }

    // handle "routing.openstreetmap.de" endpoint
    const hasDifferentPath = baseUrl?.includes('routing.openstreetmap.de')
    let urlPath = `${baseUrl}/route/v1/${profile}`
    if (hasDifferentPath) {
      urlPath = `${baseUrl}/routed-${profile}/route/v1/driving`
    }

    const url = stringifyUrl({
      url: `${urlPath}/${coords}`,
      query: params,
    })

    const response = await this.get(url)
    return this.transformer.transformRoute(response.data)
  },
})

export default OSRMService