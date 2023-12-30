import { expect } from 'vitest'

import type {
  AutocompleteResult,
  ReverseGeocodeResult,
  RouteResult,
} from './types'

/**
 * Generic route transformer test for all providers
 */
export function expectRouteTransformer(key: string, result: RouteResult) {
  const output: Partial<RouteResult> = result
  delete output.raw
  expect(output.atribution).not.toBeUndefined()
  expect(output.paths).not.toBeUndefined()
  output.paths?.forEach((path) => {
    expect(path.points).not.toBeUndefined()
    expect(path.distances).not.toBeUndefined()
    expect(path.elevations).not.toBeUndefined()
    expect(path.details).not.toBeUndefined()
    if (path.distances.length > 0) {
      expect(path.distances.length).toBe(path.points.coordinates.length)
    }
  })
}

/**
 * Generic autocomplete transformer test for all providers
 *
 * Expects to have at least one feature in the result
 */
export function expectAutocompleteTransformer(
  key: string,
  result: AutocompleteResult,
) {
  const output: Partial<AutocompleteResult> = result
  delete output.raw
  expect(output.type).toBe('FeatureCollection')
  expect(output.features).not.toBeUndefined()
  const feature = output.features?.[0]
  expect(feature).not.toBeUndefined()
  expect(feature?.type).toBe('Feature')
  expect(feature?.geometry).not.toBeUndefined()
  expect(feature?.properties).not.toBeUndefined()
  expect(feature?.properties?.id).not.toBeUndefined()
  expect(feature?.properties?.title).not.toBeUndefined()
  expect(feature?.properties?.type).not.toBeUndefined()
  expect(feature?.properties?.coordinate).not.toBeUndefined()
  expect(feature?.properties?.data).not.toBeUndefined()
}

/**
 * Generic reverse geocode transformer test for all providers
 *
 * Expects to have at least one feature in the result
 */
export function expectReverseGeocodeTransformer(
  key: string,
  result: ReverseGeocodeResult,
) {
  const output: Partial<ReverseGeocodeResult> = result
  delete output.raw
  expect(output.type).toBe('FeatureCollection')
  expect(output.features).not.toBeUndefined()
  const feature = output.features?.[0]
  expect(feature).not.toBeUndefined()
  expect(feature?.type).toBe('Feature')
  expect(feature?.geometry).not.toBeUndefined()
  expect(feature?.properties).not.toBeUndefined()
  expect(feature?.properties?.formatted).not.toBeUndefined()
  expect(feature?.properties?.data).not.toBeUndefined()
}
