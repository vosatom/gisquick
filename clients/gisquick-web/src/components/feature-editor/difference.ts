import isEqual from 'lodash/isEqual'

export function difference<T extends Record<string, unknown>>(obj1: T, obj2: T) {
  const diff = {}
  Object.keys(obj1).forEach((key) => {
    if (!isEqual(obj1[key], obj2[key])) {
      diff[key] = obj1[key]
    }
  })
  return diff as T
}
