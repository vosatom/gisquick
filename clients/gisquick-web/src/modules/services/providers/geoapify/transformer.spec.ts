import { describe, test } from 'vitest'

import mockedAutocomplete from './mock/autocomplete.json'
import mockedReverseGeocode from './mock/reverseGeocode.json'
import { GeoapifyTransformer } from './transformer'
import type { AutocompletePayload, ReverseGeocodePayload } from './types'
import {
  expectAutocompleteTransformer,
  expectReverseGeocodeTransformer,
} from '../../base/transformerTest'

const providerKey = 'geoapify'

describe(`${providerKey} autocomplete transformer`, () => {
  test('autocomplete', () => {
    const transformer = new GeoapifyTransformer()
    const result = transformer.transformAutocomplete(
      mockedAutocomplete as unknown as AutocompletePayload,
    )

    expectAutocompleteTransformer(providerKey, result)
  })
})

describe(`${providerKey} reverseGeocode transformer`, () => {
  test('reverseGeocode', () => {
    const transformer = new GeoapifyTransformer()
    const result = transformer.transformReverseGeocode(
      mockedReverseGeocode as ReverseGeocodePayload,
    )

    expectReverseGeocodeTransformer(providerKey, result)
  })
})
