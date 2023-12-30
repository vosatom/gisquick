import { describe, expect, test } from 'vitest'

import mockedRoute from './mock/route.json'
import mockedRouteNoElevations from './mock/routeNoElevations.json'
import { GraphhopperTransformer } from './transformer'
import { expectRouteTransformer } from '../../base/transformerTest'

// /maps/?point=50.10909%2C14.38358&point=50.10126%2C14.37182&profile=bike&layer=OpenStreetMap
describe('graphhopper route transformer', () => {
  test('route', () => {
    const transformer = new GraphhopperTransformer()
    const result = transformer.transformRoute(mockedRoute, {
      includeElevations: true,
    })

    expectRouteTransformer('graphhopper', result)

    expect(result.paths.length).toBe(3)
    expect(result.paths[0].points.coordinates.length).toBe(75)
    expect(result.paths[1].points.coordinates.length).toBe(49)
    expect(result.paths[2].points.coordinates.length).toBe(70)

    expect(result.paths[0].points.coordinates[0]).toStrictEqual([
      14.383580000000002, 50.10909,
    ])

    result.paths.forEach((path) => {
      delete path.points
      delete path.distances
      delete path.elevations
      delete path.waypoints
      delete path.details
    })

    expect(result).toStrictEqual({
      provider: 'graphhopper',
      paths: [
        {
          instructions: [
            {
              text: 'Pokračujte směr Zengrova',
              sign: 'depart',
              distance: 57.85,
              time: 34.71,
              interval: [0, 1],
            },
            {
              text: 'Odbočte vpravo na Na Míčánce',
              sign: 'turn_right',
              distance: 625.813,
              time: 124.582,
              interval: [1, 17],
            },
            {
              text: 'Odbočte vpravo na Na Fišerce',
              sign: 'turn_right',
              distance: 30.466,
              time: 6.093,
              interval: [17, 19],
            },
            {
              text: 'Odbočte vlevo na Na Šťáhlavce',
              sign: 'turn_left',
              distance: 359.796,
              time: 95.76,
              interval: [19, 28],
            },
            {
              text: 'Držte se vpravo na Na Pískách',
              sign: 'fork_right',
              distance: 943.721,
              time: 196.334,
              interval: [28, 54],
            },
            {
              text: 'Odbočte vpravo na Na Viničních horách',
              sign: 'turn_right',
              distance: 313.533,
              time: 70.276,
              interval: [54, 59],
            },
            {
              text: 'Odbočte vpravo na Na Pernikářce',
              sign: 'turn_right',
              distance: 22.465,
              time: 8.087,
              interval: [59, 60],
            },
            {
              text: 'Odbočte vlevo na Na Pernikářce',
              sign: 'turn_left',
              distance: 62.67,
              time: 22.561,
              interval: [60, 61],
            },
            {
              text: 'Odbočte vlevo na Na Pernikářce',
              sign: 'turn_left',
              distance: 22.89,
              time: 8.24,
              interval: [61, 62],
            },
            {
              text: 'Odbočte vpravo na Na Pernikářce',
              sign: 'turn_right',
              distance: 173.303,
              time: 45.564,
              interval: [62, 68],
            },
            {
              text: 'Odbočte vlevo na Vostrovská',
              sign: 'turn_left',
              distance: 80.409,
              time: 15.159,
              interval: [68, 70],
            },
            {
              text: 'Držte se vpravo na Na Bartoňce',
              sign: 'fork_right',
              distance: 105.782,
              time: 19.917,
              interval: [70, 73],
            },
            {
              text: 'Odbočte mírně vlevo na Vilímovská',
              sign: 'turn_slight_left',
              distance: 15.453,
              time: 3.091,
              interval: [73, 74],
            },
            {
              text: 'Příjezd do cíle',
              sign: 'arrive',
              distance: 0,
              time: 0,
              interval: [74, 74],
            },
          ],
          bbox: [14.368115, 50.100874, 14.385183, 50.112686],
          distance: 2814.152,
          time: 650.374,
          descend: 42,
          ascend: 78.5,
        },
        {
          instructions: [
            {
              text: 'Pokračujte směr Zengrova',
              sign: 'depart',
              distance: 87.101,
              time: 28.506,
              interval: [0, 1],
            },
            {
              text: 'Odbočte vpravo na Na Klimentce',
              sign: 'turn_right',
              distance: 202.906,
              time: 89.452,
              interval: [1, 6],
            },
            {
              text: 'Odbočte vlevo na Na Míčánce',
              sign: 'turn_left',
              distance: 228.401,
              time: 134.5,
              interval: [6, 13],
            },
            {
              text: 'Odbočte vlevo na Šárecká',
              sign: 'turn_left',
              distance: 259.343,
              time: 50.596,
              interval: [13, 18],
            },
            {
              text: 'Odbočte ostře vpravo na Na Hanspaulce',
              sign: 'turn_sharp_right',
              distance: 519.424,
              time: 138.573,
              interval: [18, 25],
            },
            {
              text: 'Odbočte vlevo na Na Pískách',
              sign: 'turn_left',
              distance: 95.373,
              time: 19.074,
              interval: [25, 28],
            },
            {
              text: 'Odbočte vpravo na Na Viničních horách',
              sign: 'turn_right',
              distance: 313.533,
              time: 70.276,
              interval: [28, 33],
            },
            {
              text: 'Odbočte vpravo na Na Pernikářce',
              sign: 'turn_right',
              distance: 22.465,
              time: 8.087,
              interval: [33, 34],
            },
            {
              text: 'Odbočte vlevo na Na Pernikářce',
              sign: 'turn_left',
              distance: 62.67,
              time: 22.561,
              interval: [34, 35],
            },
            {
              text: 'Odbočte vlevo na Na Pernikářce',
              sign: 'turn_left',
              distance: 22.89,
              time: 8.24,
              interval: [35, 36],
            },
            {
              text: 'Odbočte vpravo na Na Pernikářce',
              sign: 'turn_right',
              distance: 173.303,
              time: 45.564,
              interval: [36, 42],
            },
            {
              text: 'Odbočte vlevo na Vostrovská',
              sign: 'turn_left',
              distance: 80.409,
              time: 15.159,
              interval: [42, 44],
            },
            {
              text: 'Držte se vpravo na Na Bartoňce',
              sign: 'fork_right',
              distance: 105.782,
              time: 19.917,
              interval: [44, 47],
            },
            {
              text: 'Odbočte mírně vlevo na Vilímovská',
              sign: 'turn_slight_left',
              distance: 15.453,
              time: 3.091,
              interval: [47, 48],
            },
            {
              text: 'Příjezd do cíle',
              sign: 'arrive',
              distance: 0,
              time: 0,
              interval: [48, 48],
            },
          ],
          bbox: [14.368115, 50.100874, 14.384496, 50.109094],
          distance: 2189.053,
          time: 653.596,
          descend: 50.5,
          ascend: 87,
        },
        {
          instructions: [
            {
              text: 'Pokračujte směr Zengrova',
              sign: 'depart',
              distance: 57.85,
              time: 34.71,
              interval: [0, 1],
            },
            {
              text: 'Odbočte vpravo na Na Míčánce',
              sign: 'turn_right',
              distance: 625.813,
              time: 124.582,
              interval: [1, 17],
            },
            {
              text: 'Odbočte vpravo na Na Fišerce',
              sign: 'turn_right',
              distance: 30.466,
              time: 6.093,
              interval: [17, 19],
            },
            {
              text: 'Odbočte vlevo na Na Šťáhlavce',
              sign: 'turn_left',
              distance: 359.796,
              time: 95.76,
              interval: [19, 28],
            },
            {
              text: 'Držte se vpravo na Na Pískách',
              sign: 'fork_right',
              distance: 1393.261,
              time: 281.922,
              interval: [28, 63],
            },
            {
              text: 'Odbočte vpravo na Na Pernikářce',
              sign: 'turn_right',
              distance: 93.968,
              time: 103.403,
              interval: [63, 65],
            },
            {
              text: 'Odbočte ostře vpravo na Vilímovská',
              sign: 'turn_sharp_right',
              distance: 172.28,
              time: 38.91,
              interval: [65, 69],
            },
            {
              text: 'Příjezd do cíle',
              sign: 'arrive',
              distance: 0,
              time: 0,
              interval: [69, 69],
            },
          ],
          bbox: [14.370006, 50.099783, 14.385183, 50.112686],
          distance: 2733.435,
          time: 685.38,
          descend: 55,
          ascend: 91.5,
        },
      ],
      atribution: ['GraphHopper', 'OpenStreetMap contributors'],
    })
  })

  /**
   * Results are supposed to be the same except for elevations and waypoints
   */
  test('with and without elevations', () => {
    const transformer = new GraphhopperTransformer()
    const withoutElevations = transformer.transformRoute(
      mockedRouteNoElevations,
      {
        includeElevations: false,
      },
    )
    const withElevations = transformer.transformRoute(mockedRoute, {
      includeElevations: true,
    })

    delete withoutElevations.raw
    withoutElevations.paths.forEach((path) => {
      delete path.elevations
      delete path.waypoints
    })

    delete withElevations.raw
    withElevations.paths.forEach((path) => {
      delete path.elevations
      delete path.waypoints
    })

    expect(withoutElevations).toEqual(withElevations)
  })
})
