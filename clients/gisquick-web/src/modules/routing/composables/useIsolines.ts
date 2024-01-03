import type { Position } from '@turf/helpers'
import { toValue, type MaybeRef } from '@vueuse/core'
import GeoJSON from 'ol/format/GeoJSON'
import type { Geometry } from 'ol/geom'
import type { ProjectionLike } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import type { StyleLike } from 'ol/style/Style'
import { watch, type Ref } from 'vue'

import { useVectorLayer } from './useVectorLayer'
import { isolineStyle } from '../mapStyles'

import type { BaseService } from '@/modules/services/base/service'
import { useIsolineService } from '@/modules/services/composables/useIsolineService'

export function useIsolines({
  provider,
  query,
  isEnabled,
  userProjection,
  onLoad,
  style = isolineStyle,
}: {
  provider: MaybeRef<BaseService | undefined>
  query: { point: MaybeRef<Position>; profile: MaybeRef<string> }
  userProjection: ProjectionLike
  isEnabled?: Ref<boolean | undefined>
  onLoad?: (resultSource: VectorSource<Geometry>) => void
  style?: StyleLike
}) {
  const service = useIsolineService(provider, query, {
    isEnabled,
  })

  const resultSource = new VectorSource()
  useVectorLayer({
    source: resultSource,
    style,
    updateWhileAnimating: true,
  })

  const reader = new GeoJSON({ featureProjection: userProjection })
  watch(
    [service.data, isEnabled],
    ([queryResult]) => {
      resultSource.clear()
      if (!queryResult || toValue(isEnabled) === false) return
      const features = reader.readFeatures(queryResult)
      resultSource.addFeatures(features)
      onLoad?.(resultSource)
    },
    { immediate: true },
  )

  return service
}
