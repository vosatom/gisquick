import { point, featureCollection } from '@turf/helpers'
import nearestPoint from '@turf/nearest-point'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { toLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { watch, onMounted, onBeforeUnmount } from 'vue'

import { useVectorLayer } from './useVectorLayer'
import { hitTolerance } from '../constants'
import { queryPointsStyle, pathStyle } from '../mapStyles'
import { MutationKey, formatCoordinatesText } from '../store'

import { useOlMap } from '@/composables/useOlMap'
import { SyncedVectorSource } from '@/modules/routing/SyncedVectorSource'
import { useStore } from '@/store/typed'

export function usePointsLayer() {
  const store = useStore()
  const map = useOlMap()

  const pathSource = new VectorSource()
  const pathLayer = useVectorLayer({
    style: pathStyle,
    source: pathSource,
    updateWhileAnimating: true,
  })

  const pointsSource = new SyncedVectorSource({
    handleAddFeature: (feature) => {
      if (!feature) return

      const userProjection = store.state.project.config.projection
      const coordinates = feature.getGeometry().getCoordinates()
      const points = store.state.routing.query.points.features
      const uninitializedIndex = points.findIndex(
        (point) => !point.properties.isInitialized,
      )

      if (uninitializedIndex !== -1) {
        store.commit(MutationKey.setPoint, {
          index: uninitializedIndex,
          coordinates,
          properties: {
            text: formatCoordinatesText(coordinates, userProjection),
            isInitialized: true,
            isTextAccurate: false,
          },
        })
      } else {
        const filledQueryPoints = points.filter(
          (point) => point.properties.isInitialized,
        )

        let index = points.length
        /** If user clicked on existing path, find appropriate index */
        if (feature.get('source') === 'featuredrag') {
          const thePoints = featureCollection(
            filledQueryPoints.map((p) =>
              point(toLonLat(p.geometry.coordinates, userProjection)),
            ),
          )
          const targetPoint = point(toLonLat(coordinates, userProjection))
          index = nearestPoint(targetPoint, thePoints).properties.featureIndex
          index = Math.min(index, thePoints.features.length - 1)
          index = Math.max(index, 1)
        }
        store.commit(MutationKey.addPoint, { index: index, coordinates })
      }
    },
    handleChangeFeature: (feature) => {
      if (!feature) return

      const featureId = feature.getId()
      const index = store.state.routing.query.points.features.findIndex(
        (point) => point.properties.id === featureId,
      )
      if (index === -1) return
      const coordinates = feature.getGeometry().getCoordinates()
      store.commit(MutationKey.setPoint, {
        index,
        coordinates,
        properties: {
          isTextAccurate: false,
        },
      })
    },
  })

  const pointsLayer = useVectorLayer({
    source: pointsSource,
    style: queryPointsStyle,
  })

  function handleClick(event) {
    const feature = map.forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature,
      { hitTolerance },
    )

    if (!feature) {
      const newFeature = new Feature(new Point(event.coordinate))
      newFeature.set('source', 'singleclick')
      pointsSource.addFeature(newFeature)
    }
  }

  onMounted(() => {
    map.addEventListener('singleclick', handleClick)
  })

  onBeforeUnmount(() => {
    map.removeEventListener('singleclick', handleClick)
  })

  watch(
    store.state.routing.query,
    (query) => {
      pointsSource.syncFeatures(() => {
        const points = query.points.features.filter(
          (p) => p.properties.isInitialized,
        )
        const features = points.map((p) => {
          const feature = new Feature()
          feature.setId(p.properties.id)
          feature.setGeometry(new Point(p.geometry.coordinates))
          feature.set('data', p.properties)
          return feature
        })
        return features
      })
    },
    { immediate: true },
  )

  return { pointsSource, pointsLayer, pathSource, pathLayer }
}
