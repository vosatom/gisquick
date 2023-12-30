import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import type { Coordinate } from 'ol/coordinate'
import type { Extent } from 'ol/extent'

import { downloadGpxFile } from './gpx'
import type { BaseTransformer } from './transformer'
import type {
  RouteResult,
  AutocompleteResult,
  IsolineResult,
  ReverseGeocodeResult,
  GeocodeResult,
  AutocompleteLookupResult,
} from './types'

export interface ServiceMethods<T extends typeof BaseService> {
  route?(this: InstanceType<T>, options: BaseRouteRequest): Promise<RouteResult>

  isoline?(
    this: InstanceType<T>,
    options: BaseIsolineRequest,
  ): Promise<IsolineResult>

  autocomplete?(
    this: InstanceType<T>,
    options: BaseAutocompleteRequest,
  ): Promise<AutocompleteResult>

  autocompleteLookup?(
    this: InstanceType<T>,
    options: BaseAutocompleteLookupRequest,
  ): Promise<AutocompleteLookupResult>

  geocode?(
    this: InstanceType<T>,
    options: BaseGeocodeRequest,
  ): Promise<GeocodeResult>

  reverseGeocode?(
    this: InstanceType<T>,
    options: BaseReverseGeocodeRequest,
  ): Promise<ReverseGeocodeResult>
}

interface ServiceDefaultsRequest {
  key?: string
  baseUrl?: string
  locale?: string
  layers?: Record<string, { mainAttribute: string; attributes: string[] }>
}

export interface BaseRouteRequest extends Partial<ServiceDefaultsRequest> {
  /** ordered array of points to use for calculating route [lon, lat] */
  points: Coordinate[]

  profile?: string

  alternatives?: boolean

  instructions?: boolean

  elevation?: boolean

  details?: string[]

  signal: AbortSignal

  roundtrip?: { enabled: boolean, type: 'distance' | 'duration', value?: number }
}

export interface BaseAutocompleteRequest
  extends Partial<ServiceDefaultsRequest> {
  query: string
  center?: Coordinate[]
  extent?: Extent
  limit?: number
  biasToMapView?: boolean

  layers?: Record<string, { mainAttribute: string; attributes: string[] }>
}

export interface BaseAutocompleteLookupRequest
  extends Partial<ServiceDefaultsRequest> {
  id: string | number
  autocompleteResults: AutocompleteResult
}

export interface BaseIsolineRequest extends Partial<ServiceDefaultsRequest> {
  point: Coordinate

  timeLimit?: string
  distanceLimit?: string
  profile?: string
  buckets?: string
}

export interface BaseGeocodeRequest {}

export interface BaseReverseGeocodeRequest extends ServiceDefaultsRequest {
  point: Coordinate
}
export interface ServiceDefaults {
  service?: ServiceDefaultsRequest

  route?: Partial<BaseRouteRequest>
  autocomplete?: Partial<BaseAutocompleteRequest>
  autocompleteLookup?: Partial<BaseAutocompleteLookupRequest>
  isoline?: Partial<BaseIsolineRequest>
  geocode?: Partial<BaseGeocodeRequest>
  reverseGeocode?: Partial<BaseReverseGeocodeRequest>
}

export type FeatureParams = Record<string, any>

export abstract class BaseService {
  public client: AxiosInstance

  abstract transformer: BaseTransformer

  static defaults: ServiceDefaults = {
    service: {},
  }

  constructor(options: { timeout?: number } = {}) {
    this.client = axios.create({
      timeout: options.timeout ?? 2000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  params = {}
  featureParams: Record<string, FeatureParams> = {}

  setGlobalParams(newValue: ServiceDefaultsRequest) {
    ['baseUrl', 'locale', 'key', 'layers'].forEach((key) => {
      if (typeof newValue[key] !== 'undefined') this.params[key] = newValue[key]
    })
  }

  setFeatureParams(featureKey_: string, newValue: FeatureParams, additionalKeys: string[] = []) {
    if (!newValue) return

    let featureKey = featureKey_
    let keys: string[] = [
      'baseUrl',
      'locale',
      'key',
      'layers',
      ...additionalKeys,
    ]

    if (featureKey === 'route') {
      keys = [...keys, 'details', 'instructions', 'alternatives', 'elevation']
    } else if (featureKey === 'autocomplete' || featureKey === 'search') {
      keys = [...keys, 'biasToMapView']
      featureKey = 'autocomplete'
    }

    if (typeof this.featureParams[featureKey] === 'undefined') {
      this.featureParams[featureKey] = {}
    }

    keys.forEach((key) => {
      if (typeof newValue[key] !== 'undefined')
        this.featureParams[featureKey][key] = newValue[key]
    })
  }

  getFeatureParams(featureKey: string) {
    return this.featureParams[featureKey]
  }

  route?(options: BaseRouteRequest): Promise<RouteResult>

  isoline?(options: BaseIsolineRequest): Promise<IsolineResult>

  autocomplete?(options: BaseAutocompleteRequest): Promise<AutocompleteResult>

  autocompleteLookup?(
    options: BaseAutocompleteLookupRequest,
  ): Promise<AutocompleteLookupResult>

  geocode?(options: BaseGeocodeRequest): Promise<GeocodeResult>

  reverseGeocode?(
    options: BaseReverseGeocodeRequest,
  ): Promise<ReverseGeocodeResult>

  static buildMethods<T extends typeof BaseService>(
    Constructor: T,
    methods: ServiceMethods<T>,
  ) {
    Object.entries(methods).forEach(([key, method]) => {
      Constructor.prototype[key] = method
    })
  }

  public mergeOptions<T>(
    key: string,
    options: T,
  ): T & ServiceDefaults['service'] {
    return Object.assign(
      {},
      (this.constructor as typeof BaseService).defaults.service,
      (this.constructor as typeof BaseService).defaults[key],
      this.params,
      this.featureParams[key],
      options,
    )
  }

  public async downloadGpxPath(data: RouteResult, pathIndex: number) {
    downloadGpxFile(data, pathIndex)
  }

  public handleRequest<T>(response: AxiosResponse<T>) {
    if (response.status !== 200) {
      throw new Error('')
    }
    return response.data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get<T, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return this.client.get(url, config)
  }

  public post<T, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return this.client.post(url, data, config)
  }
}
