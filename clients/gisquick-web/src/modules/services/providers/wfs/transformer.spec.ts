import { expect, test } from 'vitest'

import mockData from './mock/autocomplete.json'
import { WFSTransformer } from './transformer'

test('wfs autocomplete transformerh', () => {
  const layers = { a: { mainAttribute: 'name' }, c: { mainAttribute: 'name' } }
  const transformer = new WFSTransformer()
  const result = transformer.transformAutocomplete(mockData, layers)
  delete result.raw

  const features = result.features

  expect(features.length).toBe(2)
  expect(features[0].properties.type).toBe('wfs')
  expect(features[0].properties.layerName).toBe('c')
  expect(features[0].properties.id).toBe('c.1')
  expect(features[0].properties.title).toBe('Stojan')
  expect(features[0].properties.data).not.toBeUndefined()

  expect(features[1].properties.type).toBe('wfs')
  expect(features[1].properties.layerName).toBe('a')
  expect(features[1].properties.id).toBe('a.2')
  expect(features[1].properties.title).toBe('Restaurace')
  expect(features[1].properties.data).not.toBeUndefined()
})
