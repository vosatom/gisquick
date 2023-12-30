import bbox from '@turf/bbox'
import circle from '@turf/circle'
import { lineString, point } from '@turf/helpers'
import { rand } from '@vueuse/core'
import type { AxiosResponse } from 'axios'

import mockedReverseGeocode from './mock/reverseGeocode.json'
import {
  BaseService,
  type BaseRouteRequest,
  type FeatureParams,
} from '../../base/service'
import type {
  AutocompleteResult,
  Path as BasePath,
  Instruction,
  SignName,
} from '../../base/types'
import { GraphhopperTransformer } from '../graphhopper/transformer'

const DEFAULT_COLORS = ['#bf4040', '#bfaa40', '#6abf40']

const DEFAULT_SIGNS = [
  'continue_left',
  'continue_right',
  'continue_uturn',
  'roundabout',
]

function getRandomItem<T>(arr: T[]) {
  return arr.length === 0
    ? undefined
    : arr[Math.floor(Math.random() * arr.length)]
}

class MockService extends BaseService {
  transformer = new GraphhopperTransformer()

  error: Error | undefined = undefined

  public setError(newValue: Error | undefined) {
    this.error = newValue
  }

  public handleRequest<T>(response: AxiosResponse<T>) {
    if (this.error) {
      throw new Error(this.error.message)
    }
    return super.handleRequest(response)
  }

  setFeatureParams(
    featureKey_: string,
    newValue: FeatureParams,
    additionalKeys: string[] = [],
  ) {
    super.setFeatureParams(
      featureKey_,
      newValue,
      additionalKeys.concat(['roundtrip']),
    )
  }
}

MockService.buildMethods(MockService, {
  route(options) {
    const { points, alternatives, instructions, roundtrip, colors } =
      this.mergeOptions('route', options) as BaseRouteRequest & {
        colors?: string
      }

    const paths: BasePath[] = []

    if (points.length >= 2) {
      const lineStringFeature = lineString(points)

      const path: BasePath = {
        instructions: points
          .map((p, index) => {
            const sign = getRandomItem(DEFAULT_SIGNS) ?? ''
            return {
              time: index,
              distance: index,
              interval: [index, index + 1],
              sign: sign as unknown as SignName,
              text: sign,
            } as Instruction
          })
          .slice(0, -1),
        points: lineStringFeature.geometry,
        elevations: points.map(() => rand(20, 250)),
        distances: points.map(() => 2),
        bbox: bbox(lineStringFeature),
        distance: 100,
        time: 1500,
        descend: -10,
        ascend: 35,
        details: {
          get_off_bike: [[0, 1, true]],
          road_class: [[1, 2, 'steps']],
        },
        color: colors ? getRandomItem(DEFAULT_COLORS) : undefined,
      }
      paths.push(path)
    } else if (points.length === 1 && roundtrip) {
      const lineStringFeature = circle(points[0], roundtrip.value / 20000)
      paths.push({
        instructions: [
          {
            time: 10,
            distance: 10,
            interval: [0, 1],
            sign: 'turn_sharp_left',
            text: 'Turn sharp left',
          },
          {
            time: 10,
            distance: 10,
            interval: [1, 1],
            sign: 'turn_sharp_left',
            text: 'Turn sharp left',
          },
        ],
        points: lineStringFeature.geometry,
        elevations: points.map(() => rand(20, 250)),
        distances: points.map(() => 2),
        bbox: bbox(lineStringFeature),
        distance: 100,
        time: 150,
        descend: -10,
        ascend: 35,
        details: {},
      })
    }
    if (alternatives) {
      const lineStringFeature = lineString(points)

      paths.push({
        instructions: points
          .map((p, index) => {
            const sign = getRandomItem(DEFAULT_SIGNS)
            return {
              time: index,
              distance: index,
              interval: [index, index + 1],
              sign,
              text: `${sign} - alternative`,
            }
          })
          .slice(0, -1),
        points: lineStringFeature.geometry,
        elevations: points.map(() => rand(20, 250)),
        distances: points.map(() => 2),
        bbox: bbox(lineStringFeature),
        distance: 1200,
        time: 150,
        descend: -10,
        ascend: 35,
        details: {},
        color: colors ? getRandomItem(DEFAULT_COLORS) : undefined,
      })
    }
    if (!instructions) {
      paths.forEach((path) => {
        path.instructions = []
      })
    }
    const data = {
      provider: 'fake',
      paths,
      atribution: ['Fake Industries'],
      raw: {},
    }

    return this.handleRequest({ status: 200, data })
  },

  isoline(options) {
    const { point } = this.mergeOptions('isoline', options)
    const data = {
      type: 'FeatureCollection',
      features: [0.1, 0.2, 0.3].map((radius, index) =>
        circle(point, radius, { properties: { color: DEFAULT_COLORS[index] } }),
      ),
    }
    return this.handleRequest({ status: 200, data })
  },

  reverseGeocode() {
    const data = {
      type: 'FeatureCollection',
      features: mockedReverseGeocode.features.map((feature) => {
        return {
          ...feature,
          properties: {
            formatted: feature.properties.formatted,
            data: feature.properties,
          },
        }
      }),
      raw: mockedReverseGeocode,
    }
    return this.handleRequest({ status: 200, data })
  },

  autocomplete(options) {
    const { query } = this.mergeOptions('autocomplete', options)
    const items = [
      {
        id: '1',
        title: 'First',
        position: [14.3834946818793, 50.10670438688484],
      },
      {
        id: '2',
        title: 'Second',
        position: [14.378484737900642, 50.10866497124043],
      },
    ]

    const transformedQuery = query.toLowerCase()
    const filteredItems = items.filter(
      (item) => item.title.toLowerCase().indexOf(transformedQuery) !== -1,
    )

    const data: AutocompleteResult = {
      type: 'FeatureCollection',
      features: filteredItems.map((item) =>
        point(
          item.position,
          {
            id: item.id,
            type: item.title,
            title: item.title,
            data: item,
            address: item.title,
            coordinate: item.position,
            layerName: item.title,
          },
          { id: item.id },
        ),
      ),
      raw: {},
    }

    return this.handleRequest({ status: 200, data })
  },

  async autocompleteLookup({ id, autocompleteResults }) {
    console.log({ id, autocompleteResults })

    // Try to take posititon from previous autocomplete result - undocumented
    const entry = autocompleteResults?.features.find((e) => e.id === id)
    if (!entry) {
      throw new Error(`Cannot lookup ${id}`)
    }

    return entry
  },
})

export default MockService
