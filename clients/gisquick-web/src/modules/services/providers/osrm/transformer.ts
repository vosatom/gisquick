import polyline from '@mapbox/polyline'
import type { Coordinate } from 'ol/coordinate'
import { boundingExtent } from 'ol/extent'

import type { OSRMRouteResult, Step } from './types'
import { BaseTransformer } from '../../base/transformer'
import type { Instruction, Path, SignName } from '../../base/types'

const mappings: Record<string, string> = {
  'end of road': 'end_of_road',
}

// http://project-osrm.org/docs/v5.24.0/api/
export class OSRMTransformer extends BaseTransformer {
  /** This is similar to mapbox */
  private getSignName(type: string, modifier?: string): SignName {
    const mappedType = mappings[type] ?? type
    if (modifier) {
      return `${mappedType}_${modifier}` as SignName
    }
    return mappedType as SignName
  }

  transformStep(
    step: Step,
    data: { coordinates: Coordinate[]; lastIndex },
  ): Instruction {
    const stepCoords = polyline.decode(step.geometry)
    data.coordinates.push(...stepCoords)

    const newLastIndex = data.lastIndex + stepCoords.length
    const interval = [data.lastIndex, newLastIndex] as [number, number]
    data.lastIndex = newLastIndex

    return {
      text: step.name,
      sign: this.getSignName(step.maneuver.type, step.maneuver.modifier),
      distance: step.distance,
      time: step.duration,
      interval,
    }
  }

  transformRoute(data: OSRMRouteResult) {
    const bbox = boundingExtent([
      data.waypoints[0].location,
      data.waypoints[1].location,
    ])

    const paths = data.routes.map(route => {
      const stepData = {
        coordinates: [],
        lastIndex: 0,
      }
      const leg = route.legs[0]
      const instructions = leg.steps.map(step =>
        this.transformStep(step, stepData),
      )

      const transformedPath: Path = {
        instructions,
        points: {
          type: 'LineString',
          coordinates: (route.geometry
            ? polyline.decode(route.geometry)
            : stepData.coordinates
          ).map(c => [c[1], c[0]]),
        },
        elevations: [],
        distances: [],
        bbox,
        distance: leg.distance,
        time: leg.distance,
        descend: 0,
        ascend: 0,
        details: {},
      }

      return transformedPath
    })

    return {
      provider: 'OSRM',
      paths,
      atribution: [],
      raw: data,
    }
  }
}
