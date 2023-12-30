/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from 'vitest'

import mockData from './mock.json'
import { CyclestreetsTransformer } from './transformer'
import { expectRouteTransformer } from '../../base/transformerTest'

test('cyclestreets route transformer', () => {
  const transformer = new CyclestreetsTransformer()
  const result = transformer.transformRoute(mockData, {
    includeElevations: true,
  }) as any

  expectRouteTransformer('cyclestreets', result)

  expect(result.paths[0].points.coordinates[0]).toStrictEqual([
    14.38581, 50.11095,
  ])

  delete result.raw
  result.paths.forEach((path: any) => {
    delete path.points
    delete path.distances
    delete path.elevations
  })

  expect(result).toStrictEqual({
    provider: 'cyclestreets',
    paths: [
      {
        instructions: [
          {
            text: 'Na Šťáhlavce',
            sign: 'depart',
            distance: 121,
            time: 18,
            interval: [0, 5],
          },
          {
            text: 'Rychtářská',
            sign: 'fork_right',
            distance: 193,
            time: 82,
            interval: [5, 10],
          },
          {
            text: 'Na Klimentce',
            sign: 'continue',
            distance: 48,
            time: 52,
            interval: [10, 14],
          },
          {
            text: 'Na Klimentce',
            sign: 'continue',
            distance: 155,
            time: 117,
            interval: [14, 18],
          },
          {
            text: 'Na Míčánce',
            sign: 'turn_left',
            distance: 227,
            time: 137,
            interval: [18, 29],
          },
          {
            text: 'Šárecká',
            sign: 'turn_left',
            distance: 258,
            time: 47,
            interval: [29, 37],
          },
          {
            text: 'Na Hanspaulce',
            sign: 'turn_sharp_right',
            distance: 277,
            time: 187,
            interval: [37, 44],
          },
          {
            text: 'Sušická',
            sign: 'turn_left',
            distance: 540,
            time: 156,
            interval: [44, 66],
          },
          {
            text: 'Vilímovská',
            sign: 'continue',
            distance: 84,
            time: 105,
            interval: [66, 72],
          },
        ],
        bbox: [14.37183, 50.10126, 14.38629, 50.11095],
        distance: 1903,
        time: 901,
        descend: 16,
        ascend: 66,
        waypoints: [
          [14.38581, 50.11095],
          [14.37183, 50.10126],
        ],
        details: {
          get_off_bike: [[66, 72, true]],
          road_class: [
            [0, 5, 'road'],
            [5, 10, 'residential'],
            [10, 14, 'pedestrian'],
            [14, 18, 'residential'],
            [18, 29, 'residential'],
            [29, 37, 'road'],
            [37, 44, 'residential'],
            [44, 66, 'residential'],
            [66, 72, 'residential'],
          ],
        },
      },
    ],
  })
})
