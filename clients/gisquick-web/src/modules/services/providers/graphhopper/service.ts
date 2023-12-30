import { GraphhopperTransformer } from './transformer'
import type { GraphHopperRouteResult, IsolinePayload } from './types'
import {
  BaseService,
  type BaseRouteRequest,
  type ServiceDefaults,
  type FeatureParams,
} from '../../base/service'
import { stringifyUrl } from '../../base/url'

interface GraphhopperRouteRequest extends BaseRouteRequest {
  alternatives?: boolean
}

/**
 * Documentation at https://docs.graphhopper.com/
 */
class GraphHopperRouting extends BaseService {
  transformer = new GraphhopperTransformer()

  static defaults: ServiceDefaults = {
    service: {
      key: '',
      baseUrl: '',
      locale: 'en_US',
    },

    route: {
      optimize: 'false',
      points_encoded: true,
      snap_preventions: ['ferry'],
      details: [],
    },

    isoline: {
      buckets: 3,
      timeLimit: 10,
    },
  }

  setFeatureParams(
    featureKey_: string,
    newValue: FeatureParams,
    additionalKeys: string[] = [],
  ) {
    super.setFeatureParams(
      featureKey_,
      newValue,
      additionalKeys.concat(['roundtrip']),
    )
  }
}

GraphHopperRouting.buildMethods(GraphHopperRouting, {
  async route(options: GraphhopperRouteRequest) {
    const { key, baseUrl, alternatives, roundtrip, signal, ...params } =
      this.mergeOptions('route', options)

    if (params.points.length < 3 && alternatives) {
      Object.assign(params, {
        'alternative_route.max_paths': 3,
        algorithm: 'alternative_route',
      })
    }

    if (params.points.length === 1 && roundtrip && roundtrip.type === 'distance' && typeof roundtrip.value !== 'undefined') {
      Object.assign(params, {
        algorithm: 'round_trip',
        'round_trip.distance': roundtrip.value,
        'ch.disable': true,
      })
    }

    const url = stringifyUrl({
      url: `${baseUrl}/route`,
      query: { key },
    })
    const res = await this.post<GraphHopperRouteResult>(url, params, { signal })

    return this.transformer.transformRoute(this.handleRequest(res), {
      includeElevations: params.elevation,
    })
  },

  async isoline(options) {
    const { key, baseUrl, point, ...params } = this.mergeOptions(
      'isoline',
      options,
    )

    const url = stringifyUrl({
      url: `${baseUrl}/isochrone`,
      query: { key, point: point.concat().reverse().join(','), ...params },
    })
    const res = await this.get<IsolinePayload>(url)
    return this.transformer.transformIsoline(this.handleRequest(res))
  },
})

export default GraphHopperRouting
