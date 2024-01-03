// @ts-expect-error wrong `vue-gettext` types
import { translate } from 'vue-gettext'

import type { Route, Segment, DirectionsResult } from './types'
import { summarizeElevations } from '../../base/summarizeElevations'
import { BaseTransformer, type IBaseTransformer } from '../../base/transformer'
import type { Instruction, Path, RouteResult, SignName } from '../../base/types'

const $gettext = translate.gettext

export class CyclestreetsTransformer
  extends BaseTransformer
  implements IBaseTransformer
{
  /** Match Cyclestreets instructions as close as possible */
  private getSignName(sign: string): SignName {
    switch (sign) {
      case '':
        return 'depart'
      case 'straight on':
        return 'continue'
      case 'bear right':
        return 'fork_right'
      case 'turn right':
        return 'turn_right'
      case 'sharp right':
        return 'turn_sharp_right'
      case 'double-back':
        return 'uturn'
      case 'sharp left':
        return 'turn_sharp_left'
      case 'turn left':
        return 'turn_left'
      case 'bear left':
        return 'fork_left'
      case 'join roundabout':
      case 'first exit':
      case 'second exit':
      case 'third exit':
      case 'fourth exit':
      case 'fifth exit':
      case 'sixth exit':
      case 'seventh or more exit':
        return 'roundabout'
      default:
        return 'unknown'
    }
  }

  private planToColor(plan: string): string {
    switch (plan) {
      case 'fastest':
        return '#e44141'
      case 'quietest':
        return '#5fb35f'
      case 'balanced':
        return '#ffe86f'
      default:
        return '#7f7fff'
    }
  }

  private translateLabel(label: string) {
    const tr: Record<string, string> = {
      fastest: $gettext('Fastest'),
      quietest: $gettext('Quietest'),
      balanced: $gettext('Balanced'),
    }
    return tr[label] ?? label
  }

  /** Map road class to OSM (https://wiki.openstreetmap.org/wiki/Key:highway) */
  private mapRoadClass(roadClass: string) {
    const mapping: Record<string, string> = {
      'Residential street': 'residential',
      'Service Road': 'service',
      'Minor road': 'road',
      Track: 'track',
      Steps: 'steps',
      'Cycle path': 'cycleway',
      Path: 'path',
      Footpath: 'footway',
      'Pedestrianized area': 'pedestrian',
    }
    return mapping[roadClass] ?? roadClass.toLocaleLowerCase()
  }

  transformRoute(
    data: DirectionsResult,
    options: { includeElevations?: boolean } = {},
  ) {
    const path: Path = {
      instructions: [],
      points: { type: 'LineString', coordinates: [] },
      elevations: [],
      distances: [],
      bbox: [0, 0, 0, 0],
      distance: 0,
      time: 0,
      descend: 0,
      ascend: 0,
      details: {},
    }

    let lastIntervalIndex = 0
    data.marker.forEach((data) => {
      const marker = data['@attributes']
      switch (marker.type) {
        case 'route': {
          const marker = data['@attributes'] as Route
          const coordinates = marker.coordinates
            .split(' ')
            .map((coords) => coords.split(',').map((c) => parseFloat(c)))

          path.points = {
            type: 'LineString',
            coordinates,
          }

          let currentDistance = 0
          path.distances = [currentDistance].concat(
            marker.distances.split(',').map((c) => {
              currentDistance = currentDistance + parseFloat(c)
              return currentDistance
            }),
          )

          path.descend = 0
          path.ascend = 0

          if (options.includeElevations) {
            const elevations = marker.elevations
              .split(',')
              .map((c) => parseFloat(c))

            const { ascend, descend } = summarizeElevations(elevations)
            path.ascend = ascend
            path.descend = descend
            path.elevations = elevations
          }

          path.distance = parseFloat(marker.length)
          path.time = parseFloat(marker.time)

          path.color = this.planToColor(marker.plan)
          path.label = this.translateLabel(marker.plan)

          path.bbox = [
            marker.west,
            marker.south,
            marker.east,
            marker.north,
          ].map(parseFloat) as [number, number, number, number]
          break
        }
        case 'segment': {
          const marker = data['@attributes'] as Segment

          /** Distances start from zero */
          const distancesCount = marker.distances.split(',').length - 1
          const interval: [number, number] = [
            lastIntervalIndex,
            lastIntervalIndex + distancesCount,
          ]
          lastIntervalIndex = lastIntervalIndex + distancesCount

          const instruction: Instruction = {
            text: marker.name,
            sign: this.getSignName(marker.turn),
            distance: parseFloat(marker.distance),
            time: parseFloat(marker.time),
            interval,
          }

          path.instructions.push(instruction)

          if (marker.walk === '1') {
            if (!('get_off_bike' in path.details))
              path.details.get_off_bike = []
            path.details.get_off_bike?.push([interval[0], interval[1], true])
          }

          if (marker.provisionName) {
            if (!('road_class' in path.details)) path.details.road_class = []
            path.details.road_class?.push([
              interval[0],
              interval[1],
              this.mapRoadClass(marker.provisionName),
            ])
          }
        }
      }
    })

    const waypoints: Path['waypoints'] = []
    data.waypoint.forEach((waypoint) => {
      waypoints.push([
        parseFloat(waypoint['@attributes'].longitude),
        parseFloat(waypoint['@attributes'].latitude),
      ])
    })
    path.waypoints = waypoints

    return {
      provider: 'cyclestreets',
      paths: [path],
      atribution: ['CycleStreets', 'OpenStreetMap contributors'],
      raw: data,
    } as RouteResult<DirectionsResult>
  }
}
