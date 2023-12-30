import { describe, test } from 'vitest'

import mockedRoute from './mock/route.json'
import { OSRMTransformer } from './transformer'
import { expectRouteTransformer } from '../../base/transformerTest'

const providerKey = 'osrm'

describe(`${providerKey} route transformer`, () => {
  test('route', () => {
    const transformer = new OSRMTransformer()
    const result = transformer.transformRoute(mockedRoute)

    expectRouteTransformer(providerKey, result)
  })
})
