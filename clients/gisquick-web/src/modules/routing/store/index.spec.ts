import type { Feature, Point } from '@turf/helpers'
import { describe, expect, test } from 'vitest'

import {
  QueryPointType,
  createInitialState,
  mutations,
  type QueryPointProperties,
} from './index'

const point = {
  type: 'Point',
  coordinates: [1602435.0, 6460425.27],
}

const secondPoint = {
  type: 'Point',
  coordinates: [1607704.04, 6459962.37],
}

const zeroPoint = { type: 'Point', coordinates: [0, 0] }

function expectFirstAndLastPointToBeEndPoints(
  arr: Feature<Point, QueryPointProperties>[],
) {
  expect(arr[0].properties.type).toBe(QueryPointType.Start)
  expect(arr[arr.length - 1].properties.type).toBe(QueryPointType.End)
}

describe('mutations', () => {
  test('add point', () => {
    const state = createInitialState()

    mutations.addPoint(state, { index: 0, coordinates: point.coordinates })

    expect(state.query.points.features[0]).toStrictEqual({
      type: 'Feature',
      geometry: point,
      properties: {
        id: expect.any(String),
        text: '50° 04′ 54″ N 14° 23′ 42″ E',
        type: QueryPointType.Start,
        isInitialized: true,
        index: expect.any(String),
        isTextAccurate: false,
      },
    })

    expectFirstAndLastPointToBeEndPoints(state.query.points.features)
  })

  test('set point', () => {
    const state = createInitialState()

    mutations.setPoint(state, {
      index: 1,
      coordinates: point.coordinates,
      properties: {
        text: 'Petřín',
        isInitialized: true,
      },
    })

    expect(state.query.points.features[1]).toStrictEqual({
      type: 'Feature',
      geometry: point,
      properties: {
        id: expect.any(String),
        text: 'Petřín',
        type: QueryPointType.End,
        isInitialized: true,
        index: expect.any(String),
        isTextAccurate: false,
      },
    })

    expectFirstAndLastPointToBeEndPoints(state.query.points.features)
  })

  test('remove point (2 points)', () => {
    const state = createInitialState()

    mutations.setPoint(state, {
      index: 1,
      coordinates: point.coordinates,
      properties: {
        text: 'Petřín',
        isInitialized: true,
      },
    })

    mutations.removePoint(state, {
      id: state.query.points.features[1].properties.id,
    })
    expect(state.query.points.features).toHaveLength(2)
    expect(state.query.points.features[1]).toStrictEqual({
      type: 'Feature',
      geometry: zeroPoint,
      properties: {
        id: expect.any(String),
        text: '',
        type: QueryPointType.End,
        isInitialized: false,
        index: expect.any(String),
        isTextAccurate: false,
      },
    })

    expectFirstAndLastPointToBeEndPoints(state.query.points.features)
  })

  test('remove point (more points)', () => {
    const state = createInitialState()

    mutations.addPoint(state, { index: 0, coordinates: point.coordinates })
    expect(state.query.points.features).toHaveLength(3)

    mutations.removePoint(state, {
      id: state.query.points.features[1].properties.id,
    })
    expect(state.query.points.features).toHaveLength(2)
    expect(state.query.points.features[1]).toStrictEqual({
      type: 'Feature',
      geometry: zeroPoint,
      properties: {
        id: expect.any(String),
        text: '',
        type: QueryPointType.End,
        isInitialized: false,
        index: expect.any(String),
        isTextAccurate: false,
      },
    })

    expectFirstAndLastPointToBeEndPoints(state.query.points.features)
  })

  test('move point', () => {
    const state = createInitialState()

    mutations.setPoint(state, {
      index: 0,
      coordinates: point.coordinates,
      properties: {
        text: 'Petřín',
        isInitialized: true,
      },
    })
    mutations.setPoint(state, {
      index: 1,
      coordinates: secondPoint.coordinates,
      properties: {
        text: 'Sady',
        isInitialized: true,
      },
    })

    mutations.movePoint(state, {
      fromIndex: 1,
      toIndex: 0,
    })

    expect(state.query.points.features[0].properties.text).toBe('Sady')
    expect(state.query.points.features[1].properties.text).toBe('Petřín')

    expectFirstAndLastPointToBeEndPoints(state.query.points.features)
  })
})
