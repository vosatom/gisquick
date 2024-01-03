import type { Map } from 'ol'
import { distance } from 'ol/coordinate'
import { boundingExtent, getCenter, type Extent } from 'ol/extent'

import type { MapWithExt } from '@/composables/useOlMap'

function transformToViewExtent(map: Map, extent: Extent) {
  const pixelCoordsMin = map.getPixelFromCoordinate([extent[0], extent[1]])
  const pixelCoordsMax = map.getPixelFromCoordinate([extent[2], extent[3]])

  return boundingExtent([pixelCoordsMin, pixelCoordsMax])
}

function getExtentSizes(extent: Extent) {
  const width = extent[2] - extent[0]
  const height = extent[3] - extent[1]
  return [width, height]
}

/**
 * Pans map to extent, if extent is too small, it will zoom in.
 */
export function panToExtent(
  map: MapWithExt,
  extent: Extent,
  options: {
    duration?: number
    easing?: (d: number) => number
    padding?: number[]
  } = {},
  parentExtent?: Extent,
) {
  const padding = options.padding || map.ext.visibleAreaPadding()
  const fitOptions = {
    duration: options.duration,
    easing: options.easing,
    padding,
  }

  const currentExtent = map.getView().calculateExtent()
  const currentViewExtent = transformToViewExtent(map, currentExtent)
  const viewExtent = transformToViewExtent(map, extent)

  const extentDistance = distance(
    getCenter(currentViewExtent),
    getCenter(viewExtent),
  )
  if (extentDistance > 2000) {
    fitOptions.duration = 0
  }

  const parentSizes = parentExtent
    ? getExtentSizes(transformToViewExtent(map, parentExtent))
    : undefined

  if (
    parentExtent &&
    parentSizes &&
    (parentSizes[0] < 100 || parentSizes[1] < 100)
  ) {
    map.ext.fitToExtent(parentExtent, fitOptions)
    return
  }

  map.ext.fitToExtent(extent, { ...fitOptions, maxZoom: 19 })
}
