import lineToPolygon from '@turf/line-to-polygon'

import { ValhallaTransformer } from './transformer'
import type { ValhallaRouteResult } from './types'
import { BaseService, type ServiceDefaults } from '../../base/service'
import { stringifyUrl } from '../../base/url'

/**
 * Documentation: https://valhalla.github.io/valhalla/
 */
class ValhallaRouting extends BaseService {
  transformer = new ValhallaTransformer()

  static defaults: ServiceDefaults = {
    service: {
      baseUrl: 'https://valhalla1.openstreetmap.de/',
    },
  }
}

ValhallaRouting.buildMethods(ValhallaRouting, {
  async route(options) {
    const { baseUrl, points, locale, profile } = this.mergeOptions(
      'route',
      options,
    )

    const settings: Record<string, string> = {}
    let valhalla_profile = profile
    if (!valhalla_profile || valhalla_profile === 'car') {
      valhalla_profile = 'auto'
    }

    const valhallaRequest = {
      language: locale,
      costing: valhalla_profile,
      costing_options: {
        [valhalla_profile]: { ...settings },
      },
      exclude_polygons: settings.exclude_polygons,
      locations: points.map((waypoint, index) => {
        let type = 'via'
        if (index === 0 || index === points.length - 1) {
          type = 'break'
        }
        return {
          lon: waypoint[0],
          lat: waypoint[1],
          type: type,
        }
      }),
      directions_options: {
        units: 'kilometers',
      },
      id: 'valhalla_directions',
    }

    const url = stringifyUrl({
      url: `${baseUrl}/route`,
      query: {
        json: JSON.stringify(valhallaRequest),
      },
    })

    const res = await this.get<ValhallaRouteResult>(url)
    return this.transformer.transformRoute(res.data)
  },

  async isoline(options) {
    const { baseUrl, point } = this.mergeOptions('isoline', options)

    const valhallaRequest = {
      costing: 'bicycle',
      costing_options: {
        bicycle: {
          exclude_polygons: [],
          maneuver_penalty: 5,
          country_crossing_penalty: 0,
          country_crossing_cost: 600,
          use_ferry: 1,
          use_living_streets: 0.5,
          service_penalty: 15,
          service_factor: 1,
          shortest: false,
          bicycle_type: 'Hybrid',
          cycling_speed: 20,
          use_roads: 0.5,
          use_hills: 0.5,
          avoid_bad_surfaces: 0.25,
          gate_penalty: 300,
          gate_cost: 30,
        },
      },
      contours: [{ time: 2 }, { time: 5 }, { time: 10 }],
      locations: [{ lon: point[1], lat: point[0], type: 'break' }],
      directions_options: { units: 'kilometers' },
      id: 'isochrones',
    }

    const url = stringifyUrl({
      url: `${baseUrl}/isochrone`,
      query: {
        json: JSON.stringify(valhallaRequest),
      },
    })

    const res = await this.get(url)
    return {
      type: 'FeatureCollection',
      features: res.data.features.map((feature) => lineToPolygon(feature)),
      raw: res.data,
    }
  },
})

export default ValhallaRouting
