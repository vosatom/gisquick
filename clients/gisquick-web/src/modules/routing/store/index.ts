import {
  type FeatureCollection,
  type Point,
  type Feature,
  feature,
} from '@turf/helpers'
import mapKeys from 'lodash/mapKeys'
import { nanoid } from 'nanoid'
import { toStringHDMS, type Coordinate } from 'ol/coordinate'
import { toLonLat, type ProjectionLike } from 'ol/proj'
import type { Module, Mutation, Store } from 'vuex'

import { getFeatureConfig } from '../util/getFeatureConfig'
import { move } from '../util/move'

import { type ServicesConfig } from '@/modules/services/base/configTypes'
import type { GlobalQuery, GlobalState, State } from '@/store/typed'

export const moduleKey = 'routing'

declare module '@/store/typed' {
  interface GlobalQuery {
    routing__points?: string
    routing__profile?: string
  }
}

export enum QueryPointType {
  Start,
  End,
  Other,
}

export interface QueryPointProperties {
  id: string
  text: string
  type: QueryPointType
  isInitialized: boolean
  isTextAccurate: boolean
  index: string
}

export type QueryPoint = Feature<Point, QueryPointProperties>

interface Query {
  points: FeatureCollection<Point, QueryPointProperties>
  profile: string
  roundtrip: {
    enabled: boolean
    type: 'distance' | 'duration'
    value: number
  }
}

export interface RouteState {
  query: Query
  config: ServicesConfig
  cursor: string | undefined
  isLoading: boolean
  isEnabled: boolean
}

declare module '@/store/typed' {
  export interface GlobalState {
    routing: RouteState
  }
}

function createEmptyPoint(): Feature<Point, QueryPointProperties> {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: {
      id: nanoid(),
      text: '',
      type: QueryPointType.Other,
      isInitialized: false,
      isTextAccurate: false,
      index: '',
    },
  }
}

function updatePoints(
  points: FeatureCollection<Point, QueryPointProperties>['features'],
) {
  let result = points
  if (result.length < 2) {
    result = result.concat(createEmptyPoint())
  }

  result = result.map((point, index) => {
    let type = QueryPointType.Other
    if (index === 0) {
      type = QueryPointType.Start
    } else if (index === result.length - 1) {
      type = QueryPointType.End
    }

    const currentIndex = `${index + 2}`
    if (
      point.properties.type !== type ||
      point.properties.index !== currentIndex
    ) {
      return {
        ...point,
        properties: { ...point.properties, type, index: currentIndex },
      }
    }
    return point
  })
  return result
}

function createDefaultPoints(): QueryPoint[] {
  return [createEmptyPoint(), createEmptyPoint()]
}

export const MutationKey = {
  addPoint: moduleKey + '/addPoint',
  setPoint: moduleKey + '/setPoint',
  removePoint: moduleKey + '/removePoint',
  movePoint: moduleKey + '/movePoint',
  clearPoints: moduleKey + '/clearPoints',
  reversePoints: moduleKey + '/reversePoints',
  setPoints: moduleKey + '/setPoints',
  init: moduleKey + '/init',
  setCursor: moduleKey + '/setCursor',
  setLoading: moduleKey + '/setLoading',
  setRoundtrip: moduleKey + '/setRoundtrip',
  setProfile: moduleKey + '/setProfile',
  setEnabled: moduleKey + '/setEnabled',
}

function getInitializedPoints(state: RouteState) {
  return state.query.points.features.filter((p) => p.properties.isInitialized)
}

export function formatCoordinatesText(
  coordinates?: Coordinate,
  userProjection?: ProjectionLike,
) {
  return coordinates ? toStringHDMS(toLonLat(coordinates, userProjection)) : ''
}

export const mutations: Record<
  keyof typeof MutationKey,
  Mutation<RouteState>
> = {
  addPoint(
    state,
    { index, coordinates }: { index: number; coordinates?: Coordinate },
  ) {
    const id = nanoid()
    const newPoint: QueryPoint = feature<Point, QueryPointProperties>(
      { type: 'Point', coordinates: coordinates ?? [0, 0] },
      {
        id,
        text: formatCoordinatesText(coordinates),
        type: QueryPointType.Other,
        isInitialized: !!coordinates,
        index: '',
        isTextAccurate: false,
      },
    )

    let newPoints = state.query.points.features
    newPoints.splice(index, 0, newPoint)

    newPoints = updatePoints(newPoints)
    state.query.points.features = newPoints
  },

  setPoint(
    state,
    {
      index,
      coordinates,
      properties,
    }: {
      index: number
      coordinates: Coordinate
      properties: Partial<QueryPointProperties>
    },
  ) {
    const point = state.query.points.features[index]
    state.query.points.features[index] = {
      ...point,
      geometry: coordinates
        ? { ...point.geometry, coordinates }
        : point.geometry,
      properties: { ...point.properties, ...properties },
    }

    let newPoints = state.query.points.features
    newPoints = updatePoints(newPoints)
    state.query.points.features = newPoints
    state.query.points = { ...state.query.points }
  },

  /**
   * Remove point with given id
   *
   * Use clearPoint to clear value only
   */
  removePoint(
    state,
    { id, clearValueOnly = false }: { id: string; clearValueOnly?: boolean },
  ) {
    const foundPoint = state.query.points.features.find(
      (point) => point.properties.id === id,
    )
    if (!foundPoint) return

    const willRemove = !clearValueOnly && state.query.points.features.length > 2

    if (willRemove) {
      state.query.points.features = state.query.points.features.filter(
        (point) => point !== foundPoint,
      )
    } else {
      foundPoint.geometry.coordinates = [0, 0]
      foundPoint.properties.text = ''
      foundPoint.properties.type = QueryPointType.End
      foundPoint.properties.isInitialized = false
      foundPoint.properties.isTextAccurate = false
    }

    state.query.points.features = updatePoints(state.query.points.features)
    state.query.points = { ...state.query.points }
  },

  movePoint(
    state,
    { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
  ) {
    state.query.points.features = move(
      state.query.points.features,
      fromIndex,
      toIndex,
    )
    state.query.points.features = updatePoints(state.query.points.features)
    state.query.points = { ...state.query.points }
  },

  clearPoints(state) {
    state.query.points.features = createDefaultPoints()
    state.query.points.features = updatePoints(state.query.points.features)
    state.query.points = { ...state.query.points }
  },

  reversePoints(state) {
    state.query.points.features.reverse()
    state.query.points.features = updatePoints(state.query.points.features)
    state.query.points = { ...state.query.points }
  },

  setPoints(state, features) {
    state.query.points.features = features
    state.query.points.features = updatePoints(state.query.points.features)
    state.query.points = { ...state.query.points }
  },

  setCursor(state, newCursor) {
    state.cursor = newCursor
  },

  setLoading(state, isLoading) {
    state.isLoading = isLoading
  },

  setEnabled(state, isEnabled) {
    state.isEnabled = isEnabled
  },

  init(state, newState) {
    state.query.profile =
      newState.config.features?.route?.settings.defaultProfile
    state.config = newState.config
    state.query.points.features = updatePoints(state.query.points.features)
  },

  setRoundtrip(state, newValue) {
    state.query.roundtrip = { ...state.query.roundtrip, ...newValue }
  },

  setProfile(state, newValue) {
    state.query.profile = newValue
  },
}

export function createInitialState(): RouteState {
  return {
    config: {
      providers: {},
      profiles: {},
      features: {},
    },
    query: {
      profile: '',
      points: {
        type: 'FeatureCollection',
        features: createDefaultPoints(),
      },
      roundtrip: {
        enabled: false,
        type: 'distance',
        value: 10000,
      },
    },
    isLoading: false,
    isEnabled: false,
    cursor: undefined,
  }
}

export const store: Module<RouteState, State> = {
  namespaced: false,
  state: createInitialState,

  getters: {
    [moduleKey + '/initializedPoints']: getInitializedPoints,
  },

  mutations: mapKeys(mutations, (value, key) => moduleKey + '/' + key),
}

export function getQueryFromState(store: Store<GlobalState>): GlobalQuery {
  if (!store.state.routing.isEnabled) return {}
  const initializedPoints = getInitializedPoints(store.state.routing)

  const points = initializedPoints
    .map((point) => point.geometry.coordinates.join(','))
    .join('|')

  return {
    tool: 'routing',
    routing__points: points,
    routing__profile: store.state.routing.query.profile,
  }
}

export function loadStateFromQuery(
  store: Store<GlobalState>,
  queryParams: GlobalQuery,
) {
  const points = queryParams.routing__points
    ? queryParams.routing__points.split('|').map((item, index) => {
        const coordinates = item.split(',').map((c) => parseFloat(c))
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates },
          properties: {
            id: `${index}`,
            text: formatCoordinatesText(coordinates),
            type: QueryPointType.Start,
            isInitialized: true,
            isTextAccurate: false,
            index: '',
          },
        }
      })
    : []

  const config = store.state.routing.config
  const featureConfig = getFeatureConfig(config, 'route')
  if (points.length) {
    store.commit(MutationKey.setPoints, points)
  }

  store.commit(
    MutationKey.setProfile,
    queryParams.routing__profile ?? featureConfig?.settings.defaultProfile,
  )

  if (queryParams.tool === 'routing') {
    store.commit('activeTab', 'routing')
  }
}
