import type { FeatureCollection, Point } from '@turf/helpers'
import {
  watchDebounced,
  type MaybeRef,
  toValue,
  type MaybeRefOrGetter,
} from '@vueuse/core'
import { toLonLat } from 'ol/proj'

import type { ServiceOptions } from './serviceTypes'
import { handleRequest } from './util'
import type { BaseService } from '../base/service'
import type { RouteResult } from '../base/types'

import type { QueryPointProperties } from '@/modules/routing/store'

type Data = RouteResult

export function useRoutingService(
  provider: MaybeRefOrGetter<BaseService>,
  query: {
    points: MaybeRefOrGetter<FeatureCollection<Point, QueryPointProperties>>
    profile: MaybeRef<string>
    roundtrip: MaybeRef<{
      enabled: boolean
      type: 'distance' | 'duration'
      value: number
    }>
  },
  options: ServiceOptions<Data> & { userProjection: string } = {
    userProjection: 'EPSG:3857',
  },
) {
  let prevData: { paramId: string; data: Data } | undefined = undefined

  const handler = handleRequest(
    'route',
    provider,
    options,
    async (_provider, { signal }) => {
      const points = toValue(query.points).features
      const filledQueryPoints = points.filter((p) => p.properties.isInitialized)

      const roundtrip = toValue(query.roundtrip)
      const neededPoints = roundtrip.enabled ? 1 : 2
      if (filledQueryPoints.length < neededPoints) {
        return
      }

      const params = {
        points: filledQueryPoints.map((p) =>
          toLonLat(p.geometry.coordinates, options.userProjection),
        ),
        profile: toValue(query.profile),
        roundtrip,
      }

      const paramId = JSON.stringify(params)
      let newData: Data
      if (prevData?.paramId === paramId) {
        newData = prevData.data
      } else {
        newData = await _provider.route({ ...params, signal })
      }

      prevData = { paramId, data: newData }

      return newData
    },
  )

  watchDebounced(
    [provider, query.points, query.profile, query.roundtrip],
    handler.refetch,
    {
      debounce: options.debounce ?? 200,
      // @ts-expect-error - wrong ts types
      immediate: true,
    },
  )

  return handler
}
