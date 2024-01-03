import turfDistance from '@turf/distance'
import { point } from '@turf/helpers'

import type {
  GraphHopperRouteResult,
  Instruction as GraphhopperInstruction,
  IsolinePayload,
} from './types'
import { BaseTransformer, type IBaseTransformer } from '../../base/transformer'
import type {
  Instruction,
  IsolineResult,
  Path,
  RouteResult,
  SignName,
} from '../../base/types'

const DEFAULT_COLORS = ['#bf4040', '#bfaa40', '#6abf40']

export class GraphhopperTransformer
  extends BaseTransformer
  implements IBaseTransformer
{
  /**
   * Taken from https://github.com/graphhopper/directions-api-js-client/blob/master/src/GHUtil.js
   */
  decodePath(encoded: string, is3D = false): Path['points']['coordinates'] {
    const len = encoded.length
    let index = 0
    const array = []
    let lat = 0
    let lng = 0
    let ele = 0

    while (index < len) {
      let b
      let shift = 0
      let result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
      lat += deltaLat

      shift = 0
      result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const deltaLon = result & 1 ? ~(result >> 1) : result >> 1
      lng += deltaLon

      if (is3D) {
        // elevation
        shift = 0
        result = 0
        do {
          b = encoded.charCodeAt(index++) - 63
          result |= (b & 0x1f) << shift
          shift += 5
        } while (b >= 0x20)
        const deltaEle = result & 1 ? ~(result >> 1) : result >> 1
        ele += deltaEle
        array.push([lng * 1e-5, lat * 1e-5, ele / 100])
      } else array.push([lng * 1e-5, lat * 1e-5])
    }
    return array
  }

  /** Match GH instructions as close as possible */
  protected getSignName(sign: number): SignName {
    switch (sign) {
      case -98: // an U-turn without the knowledge if it is a right or left U-turn
        return 'uturn'
      case -8: // a left U-turn
        return 'uturn'
      case -7: // keep left
        return 'fork_left'
      case -6: // not yet used: leave roundabout
        return 'roundabout'
      case -3: // turn sharp left
        return 'turn_sharp_left'
      case -2: // turn left
        return 'turn_left'
      case -1: // turn slight left
        return 'turn_slight_left'
      case 0: // continue on street
        return 'depart'
      case 1: // turn slight right
        return 'turn_slight_right'
      case 2: // turn right
        return 'turn_right'
      case 3: // turn sharp right
        return 'turn_sharp_right'
      case 4: // the finish instruction before the last point
        return 'arrive'
      case 5: // the instruction before a via point
        return 'arrive'
      case 6: // the instruction before entering a roundabout
        return 'roundabout'
      case 7: // keep right
        return 'fork_right'
      case 8: // a right U-turn
        return 'uturn'
      default: // For future compatibility it is important that all clients are able to handle also unknown instruction sign numbers
        return 'unknown'
    }
  }

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
        (['road_class', 'surface', 'get_off_bike'] as const).forEach(
          (detailKey) => {
            if (path.details[detailKey]) {
              transformedPath.details[detailKey] = path.details[detailKey]
            }
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
