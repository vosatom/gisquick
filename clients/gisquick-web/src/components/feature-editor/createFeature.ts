import Feature from 'ol/Feature'

export function createFeature(fields) {
  const properties = { ...fields }
  Object.entries(properties).forEach(([name, value]) => {
    if (typeof value === 'boolean') {
      properties[name] = value ? '1' : '0'
    }
  })
  const f = new Feature()
  f.setProperties(properties)
  return f
}
