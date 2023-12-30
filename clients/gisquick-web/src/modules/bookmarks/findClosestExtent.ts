import type { Coordinate } from 'ol/coordinate'
import { getCenter, type Extent } from 'ol/extent'
import { LineString } from 'ol/geom'

export function findClosestExtent<T extends { extent: Extent }>(
  arr: T[],
  position: Coordinate,
) {
  const closest = { distance: Infinity, item: undefined } as {
    distance: number
    item: T | undefined
  }
  arr.forEach((item) => {
    const extentCenter = getCenter(item.extent)
    const segment = new LineString([position, extentCenter])
    const length = segment.getLength()
    if (length < closest.distance) {
      closest.distance = length
      closest.item = item
    }
  })
  return closest.item
}
