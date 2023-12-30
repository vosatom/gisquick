import GeoJSON from 'ol/format/GeoJSON'

import { formatFeatures } from '@/formatters'
import { layerFeaturesQuery } from '@/map/featureinfo'
import { ShallowArray } from '@/utils'

// Moved from GenericInfoPanel
export async function fetchRelationsData($http, project, layer, feature) {
  if (feature._relationsData) {
    return feature._relationsData
  }
  const mapProjection = project.config.projection
  const tasks = layer.relations.map(async (rel) => {
    const filters = rel.referencing_fields.map((field, i) => ({
      attribute: field,
      operator: '=',
      value: feature.get(rel.referenced_fields[i]),
    }))
    const sortFilters = rel.referenced_fields.map((name) => ({
      name,
      order: 'ASC',
    }))
    const query = layerFeaturesQuery(rel.referencing_layer, null, filters, undefined, sortFilters)
    const params = {
      VERSION: '1.1.0',
      SERVICE: 'WFS',
      REQUEST: 'GetFeature',
      OUTPUTFORMAT: 'GeoJSON',
      MAXFEATURES: 100,
    }
    const headers = { 'Content-Type': 'text/xml' }
    const { data } = await $http.post(project.config.ows_url, query, {
      params,
      headers,
    })
    const parser = new GeoJSON()
    const features = parser.readFeatures(data, {
      featureProjection: mapProjection,
    })
    formatFeatures(project, rel.referencing_layer, features)
    return ShallowArray(features)
  })
  const results = await Promise.all(tasks)
  const relationsData = {}
  layer.relations.map((r, i) => {
    relationsData[r.name] = results[i]
  })
  feature._relationsData = relationsData
  return relationsData
}
