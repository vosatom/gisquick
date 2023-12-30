import { decodePath } from './polyline'
import type { Maneuver, ValhallaRouteResult } from './types'
import { BaseTransformer } from '../../base/transformer'
import type { Instruction, Path, RouteResult, SignName } from '../../base/types'

/**  */
export class ValhallaTransformer extends BaseTransformer {
  /** Match maneuver as close as possible */
  private getSignName(sign: number): SignName {
    switch (sign) {
      case 1: // kStart
        return 'depart'
      case 2: // kStartRight
        return 'depart_right'
      case 3: // kStartLeft
        return 'depart_left'
      case 4: // kDestination
        return 'arrive'
      case 5: // kDestinationRight
        return 'arrive_right'
      case 6: // kDestinationLeft
        return 'arrive_left'
      case 8: // kContinue
        return 'continue'
      case 9: // kSlightRight
        return 'turn_slight_right'
      case 10: // kRight
        return 'turn_right'
      case 11: // kSharpRight
        return 'turn_sharp_right'
      case 12: // kUturnRight
      case 13: // kUturnLeft
        return 'uturn'
      case 14: // kSharpLeft
        return 'turn_sharp_left'
      case 15: // kLeft
        return 'turn_left'
      case 16: // kSlightLeft
        return 'turn_slight_left'
      case 17: // kRampStraight
        return 'on_ramp_straight'
      case 18: // kRampRight
        return 'on_ramp_right'
      case 19: // kRampLeft
        return 'on_ramp_left'
      case 25: // kMerge
        return 'merge_straight'
      case 26: // kRoundaboutEnter
      case 27: // kRoundaboutExit
        return 'roundabout'
      case 37: // kMergeRight
        return 'merge_right'
      case 38: // kMergeLeft
        return 'merge_left'
      default:
        return 'unknown'
    }
  }

  transformInstruction(maneuver: Maneuver): Instruction {
    return {
      text: maneuver.instruction,
      sign: this.getSignName(maneuver.type),
      distance: maneuver.length * 1000,
      time: maneuver.time,
      interval: [maneuver.begin_shape_index, maneuver.end_shape_index],
    }
  }

  transformRoute(data: ValhallaRouteResult): RouteResult {
    const paths = data.trip.legs.map((leg) => {
      const points = decodePath(leg.shape)
      const transformedPath: Path = {
        instructions: leg.maneuvers.map((maneuver) =>
          this.transformInstruction(maneuver),
        ),
        points: {
          type: 'LineString',
          coordinates: points,
        },
        elevations: [],
        distances: [],
        bbox: [
          leg.summary.min_lon,
          leg.summary.min_lat,
          leg.summary.max_lon,
          leg.summary.max_lat,
        ],
        details: {},
        distance: leg.summary.length * 1000,
        time: leg.summary.time,
        descend: 0,
        ascend: 0,
      }

      return transformedPath
    })

    return {
      provider: 'valhalla',
      paths,
      atribution: ['© OpenStreetMap contributors'],
      raw: data,
    }
  }
}
