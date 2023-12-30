export interface ProviderConfig {
  id: string
  /** Must be one of supported types */
  type: string
  /** true by default */
  enabled?: boolean
  settings: {
    baseUrl?: string
    key?: string
    /** Defaults to user/project settings */
    locale?: string
    profiles?: ProfileConfig[]
  }
}

interface BaseFeatureConfig {
  /** Provider id */
  provider: string
  enabled: boolean
  settings: Record<string, unknown>
}

export interface Route extends BaseFeatureConfig {
  id: 'route'
  settings: {
    alternatives: boolean
    instructions: boolean
    instructionsSigns: boolean
    details: string[]
    autoUpdate: boolean
    elevation: boolean
    defaultProfile: string
    /** zero if infinity */
    maxPoints: number
  }
}
export interface Isoline extends BaseFeatureConfig {
  id: 'isoline'
  settings: {
    time: boolean
    distance: boolean
    autoUpdate: boolean
    defaultProfile: string
  }
}
export interface Autocomplete extends BaseFeatureConfig {
  id: 'autocomplete'
  settings: {
    biasToMapView: boolean
    autoUpdate: boolean
  }
}
export interface Search extends Omit<BaseFeatureConfig, 'provider'> {
  id: 'search'
  provider: string[]
  settings: {
    biasToMapView: boolean
    autoUpdate: boolean
  }
}
export interface Geocode extends BaseFeatureConfig {
  id: 'geocode'
}
export interface ReverseGeocode extends BaseFeatureConfig {
  id: 'reverseGeocode'
}
export interface MapMatch extends BaseFeatureConfig {
  id: 'mapMatch'
  settings: {
    details: string[]
  }
}
export interface Comments extends BaseFeatureConfig {
  id: 'comments'
}

interface ProfileConfig {
  id: string
  label: string
  /** Provider specific details */
  provider?: Record<string, unknown>
}

export interface ServicesConfig {
  providers: Record<string, ProviderConfig>
  features: {
    route?: Route
    isoline?: Isoline
    autocomplete?: Autocomplete
    search?: Search
    geocode?: Geocode
    reverseGeocode?: ReverseGeocode
    mapMatch?: MapMatch
    comments?: Comments
  }
}
