import { describe, test } from 'vitest'

import mockedAutocomplete from './mock/autocomplete.json'
import mockedReverseGeocode from './mock/reverseGeocode.json'
import { NominatimTransformer } from './transformer'
import { expectAutocompleteTransformer, expectReverseGeocodeTransformer } from '../../base/transformerTest'

const providerKey = 'nominatim'

describe(`${providerKey} autocomplete transformer`, () => {
  test('autocomplete', () => {
    const transformer = new NominatimTransformer()
    const result = transformer.transformAutocomplete(mockedAutocomplete)

    expectAutocompleteTransformer(providerKey, result)
  })
})

describe(`${providerKey} reverseGeocode transformer`, () => {
  test('reverseGeocode', () => {
    const transformer = new NominatimTransformer()
    const result = transformer.transformReverseGeocode(mockedReverseGeocode)

    expectReverseGeocodeTransformer(providerKey, result)
  })
})
