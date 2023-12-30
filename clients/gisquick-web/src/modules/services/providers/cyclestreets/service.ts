import { CyclestreetsTransformer } from './transformer'
import type { DirectionsPayload, DirectionsResult } from './types'
import {
  BaseService,
  type FeatureParams,
  type ServiceDefaults,
} from '../../base/service'
import type { RouteResult } from '../../base/types'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://www.cyclestreets.net/api/
 */
class CyclestreetsService extends BaseService {
  transformer = new CyclestreetsTransformer()

  static defaults: ServiceDefaults = {
    service: {
      key: '',
      baseUrl: 'https://www.cyclestreets.net',
    },
  }

  constructor() {
    /** Cyclestreets has a bit longer response */
    super({ timeout: 100000 })
  }

  /** Download GPX file from server instead of generating one */
  public async downloadGpxPath(data: RouteResult<object>, pathIndex: number) {
    const { baseUrl } = this.mergeOptions('route', {})
    let itinerary = ''
    let plan = ''

    const markers = data.raw?.[pathIndex].marker
    const marker = markers?.find(
      (marker) => marker['@attributes'].type === 'route',
    )
    if (marker) {
      itinerary = marker['@attributes'].itinerary
      plan = marker['@attributes'].plan
    }

    if (itinerary && plan) {
      const url = `${baseUrl}/journey/${itinerary}/cyclestreets${itinerary}${plan}.gpx`
      window.open(url)
    } else {
      throw new Error('Cannot download GPX file')
    }
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

CyclestreetsService.buildMethods(CyclestreetsService, {
  async route(options) {
    const { key, baseUrl, points, alternatives, elevation, roundtrip } =
      this.mergeOptions('route', options)
    const itinerarypoints = points.map((p) => p.join(',')).join('|')

    const res: DirectionsResult[] = []

    const query: Record<string, string | number | undefined> = {
      key,
      reporterrors: 1,
      itinerarypoints,
      plan: 'balanced',
    }

    if (roundtrip?.enabled) {
      query.plan = 'leisure'
      query[roundtrip.type === 'duration' ? 'duration' : 'distance'] =
        roundtrip.type === 'distance' ? roundtrip.value : 0
    }

    const url = stringifyUrl({
      url: `${baseUrl}/api/journey.json`,
      query,
    })
    const result = await this.get<DirectionsPayload>(url)
    if ('error' in result.data) throw new Error(result.data.error)

    if (roundtrip?.enabled) {
      return this.transformer.transformRoute(result.data, {
        includeElevations: elevation,
      })
    }

    res.push(result.data)

    const routeMarker = result.data.marker.find(
      (marker) => marker['@attributes'].type === 'route',
    )
    if (!routeMarker) throw new Error()
    const itinerary = routeMarker['@attributes'].itinerary

    if (alternatives) {
      const plans = ['fastest', 'quietest']
      await Promise.all(
        plans.map((plan) => {
          const url = stringifyUrl({
            url: `${baseUrl}/api/journey.json`,
            query: {
              key,
              reporterrors: 1,
              itinerary,
              plan,
            },
          })
          return this.get<DirectionsPayload>(url)
            .then((result) => {
              if ('error' in result.data) throw new Error(result.data.error)
              return result.data
            })
            .then((result) => res.push(result))
        }),
      )
    }

    const results = await res
    // TODO: check if the other plans are same

    const transformedResults = results.map((res) =>
      this.transformer.transformRoute(res, {
        includeElevations: elevation,
      }),
    )

    return {
      ...transformedResults[0],
      paths: transformedResults.map((result) => result.paths[0]),
      raw: results,
    }
  },
})

export default CyclestreetsService
