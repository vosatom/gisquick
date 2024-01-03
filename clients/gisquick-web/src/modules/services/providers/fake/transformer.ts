import turfDistance from '@turf/distance'
import { point } from '@turf/helpers'

import type {
  GraphHopperRouteResult,
  Instruction as GraphhopperInstruction,
  IsolinePayload,
} from './types'
import type {
  Instruction,
  IsolineResult,
  Path,
  RouteResult,
} from '../../base/types'
import { GraphhopperTransformer } from '../graphhopper/transformer'

const DEFAULT_COLORS = ['#bf4040', '#bfaa40', '#6abf40']

export class FakeTransformer extends GraphhopperTransformer {
  transformInstruction(instruction: GraphhopperInstruction): Instruction {
    return {
      text: instruction.text,
      sign: this.getSignName(instruction.sign),
      distance: instruction.distance,
      time: instruction.time / 1000,
      interval: instruction.interval as [number, number],
    }
  }

  transformRoute(
    data: GraphHopperRouteResult,
    { includeElevations = false } = {},
  ): RouteResult<GraphHopperRouteResult> {
    const paths = data.paths.map((path) => {
      const points = this.decodePath(path.points, includeElevations)
      const transformedPath: Path = {
        instructions: path.instructions?.map((instruction) =>
          this.transformInstruction(instruction),
        ),
        points: {
          type: 'LineString',
          coordinates: points.map((point) => [point[0], point[1]]),
        },
        elevations: includeElevations ? points.map((point) => point[2]) : [],
        distances: [],
        bbox: path.bbox as [number, number, number, number],
        distance: path.distance,
        time: path.time / 1000,
        descend: path.descend,
        ascend: path.ascend,
        details: {},
      }

      if (path.details) {
        ;(['road_class', 'surface', 'get_off_bike'] as const).forEach(
          (detailKey) => {
            transformedPath.details[detailKey] = path.details[detailKey]
          },
        )
      }

      // @TODO: Calculate lazily
      const coordinates = transformedPath.points.coordinates
      let currentDistance = 0
      transformedPath.distances.push(currentDistance)
      for (let i = 0; i < coordinates.length - 1; i++) {
        const from = point(coordinates[i])
        const to = point(coordinates[i + 1])

        const distance = turfDistance(from, to, { units: 'meters' })
        currentDistance = currentDistance + distance
        transformedPath.distances.push(currentDistance)
      }

      transformedPath.waypoints = this.decodePath(path.snapped_waypoints, true)

      return transformedPath
    })

    return {
      provider: 'graphhopper',
      paths,
      atribution: data.info.copyrights,
      raw: data,
    }
  }

  transformIsoline(data: IsolinePayload): IsolineResult {
    return {
      type: 'FeatureCollection',
      features: data.polygons.map((polygon, index) => ({
        ...polygon,
        properties: { ...polygon.properties, color: DEFAULT_COLORS[index] },
      })),
      raw: data,
    }
  }
}
