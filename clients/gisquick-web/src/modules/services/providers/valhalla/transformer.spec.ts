import { describe, expect, test } from 'vitest'

import mockedRoute from './mock/route.json'
import { ValhallaTransformer } from './transformer'
import { expectRouteTransformer } from '../../base/transformerTest'

const providerKey = 'valhalla'

describe(`${providerKey} route transformer`, () => {
  test('route', () => {
    const transformer = new ValhallaTransformer()
    const result = transformer.transformRoute(mockedRoute)

    expectRouteTransformer(providerKey, result)

    expect(result.paths.length).toBe(1)
    expect(result.paths[0].points.coordinates.length).toBe(116)

    expect(result.paths[0].points.coordinates[0]).toStrictEqual([
      14.383585, 50.109096,
    ])

    result.paths.forEach((path) => {
      delete path.points
      delete path.distances
      delete path.elevations
      delete path.waypoints
      delete path.details
    })

    expect(result).toStrictEqual({
      provider: 'valhalla',
      paths: [
        {
          instructions: [
            {
              text: 'Drive northwest on Zengrova.',
              sign: 'depart_left',
              distance: 56,
              time: 6.833,
              interval: [0, 1],
            },
            {
              text: 'Turn right onto Na Míčánce.',
              sign: 'turn_right',
              distance: 626,
              time: 77.632,
              interval: [1, 18],
            },
            {
              text: 'Turn right onto Na Fišerce.',
              sign: 'turn_right',
              distance: 30,
              time: 3.292,
              interval: [18, 20],
            },
            {
              text: 'Turn left onto Na Šťáhlavce.',
              sign: 'turn_left',
              distance: 55,
              time: 5.22,
              interval: [20, 23],
            },
            {
              text: 'Bear left onto Šárecká.',
              sign: 'turn_slight_left',
              distance: 305,
              time: 25.563,
              interval: [23, 35],
            },
            {
              text: 'Turn right onto Na Pískách.',
              sign: 'turn_right',
              distance: 1500,
              time: 118.885,
              interval: [35, 98],
            },
            {
              text: 'Turn right onto Evropská/7.',
              sign: 'turn_right',
              distance: 175,
              time: 13.804,
              interval: [98, 101],
            },
            {
              text: 'Turn right onto Vilímovská.',
              sign: 'turn_right',
              distance: 411,
              time: 51.297,
              interval: [101, 115],
            },
            {
              text: 'Your destination is on the left.',
              sign: 'arrive_left',
              distance: 0,
              time: 0,
              interval: [115, 115],
            },
          ],
          bbox: [14.367605, 50.098883, 14.385187, 50.112686],
          distance: 3160,
          time: 302.53,
          descend: 0,
          ascend: 0,
        },
      ],
      atribution: ['© OpenStreetMap contributors'],
    })
  })
})
