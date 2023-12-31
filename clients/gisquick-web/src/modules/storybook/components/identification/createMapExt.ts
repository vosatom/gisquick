import type { Map } from 'ol'
import { boundingExtent } from 'ol/extent'

const defaultPadding = [30, 30, 30, 30]

export function createMapExt(map: Map) {
  const ext = {
    visibleAreaPadding: () => defaultPadding,
    visibleAreaExtent: () => {
      const { top, right, bottom, left } = map.getViewport().getBoundingClientRect()
      const p1 = map.getCoordinateFromPixel([left, top])
      const p2 = map.getCoordinateFromPixel([right, bottom])
      return boundingExtent([p1, p2])
    },
    fitToExtent: (extent, options: { padding?: number[] } = {}) => {
      const padding = options.padding ?? defaultPadding
      map.getView().fit(extent, { duration: 450, padding, maxZoom: 17 })
    },
    fitToPoint: (point, options: { padding?: number[] } = {}) => {
      const padding = options.padding ?? defaultPadding
      map.getView().fit(point, { duration: 450, padding, maxZoom: 17 })
    },
    zoomToFeature: (feature, options = {}) => {
      const geom = feature.getGeometry()
      if (!geom) {
        return
      }
      const resolution = map.getView().getResolution()
      const padding = options.padding || ext.visibleAreaPadding()
      if (geom.getType() === 'Point') {
        const center = geom.getCoordinates()
        center[0] += (-padding[3] * resolution + padding[1] * resolution) / 2
        center[1] += (-padding[2] * resolution + padding[0] * resolution) / 2
        map.getView().animate({
          center,
          duration: 450,
        })
      } else {
        const extent = geom.getExtent()
        // add 5% buffer (padding)
        const buffer =
          (map.getSize()[0] - padding[1] - padding[3]) * 0.05 * resolution
        map
          .getView()
          .fit(bufferExtent(extent, buffer), { duration: 450, padding })
      }
    },
    getPermalinkQueryParams: () => {
      return {}
    }
  }
  return ext
}
