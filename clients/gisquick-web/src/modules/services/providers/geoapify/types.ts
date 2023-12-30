import type { FeatureCollection, Geometry } from '@turf/helpers'

export interface AutocompleteParams {
  text: string
  apiKey?: string
  lang?: string
  bias?: string
}

export interface ReverseGeocodePayload
  extends FeatureCollection<Geometry, ReverseGeocodeProperties> {}

export interface ReverseGeocodeProperties {
  address_line1?: string
  address_line2?: string
  city?: string
  country_code?: string
  country?: string
  datasource?: Datasource
  distance?: number
  district?: string
  formatted: string
  housenumber?: string
  lat?: number
  lon?: number
  name?: string
  place_id?: string
  plus_code_short?: string
  plus_code?: string
  postcode?: string
  rank?: Rank
  result_type?: string
  state?: string
  street?: string
  suburb?: string
  timezone?: Timezone
}

interface Datasource {
  sourcename?: string
  attribution?: string
  license?: string
  url?: string
}

interface Rank {
  importance?: number
  popularity?: number

  confidence?: number
  confidence_city_level?: number
  match_type?: string
}

interface Timezone {
  name: string
  offset_STD: string
  offset_STD_seconds: number
  offset_DST: string
  offset_DST_seconds: number
  abbreviation_STD: string
  abbreviation_DST: string
}

export interface AutocompletePayload
  extends FeatureCollection<Geometry, AutocompleteProperties> {}

export interface AutocompleteProperties {
  address_line1?: string
  address_line2?: string
  category?: string
  city?: string
  country_code?: string
  country?: string
  datasource?: Datasource
  distance?: number
  formatted?: string
  lat?: number
  lon?: number
  place_id?: string
  plus_code?: string
  postcode?: string
  rank?: Rank
  result_type?: string
  state?: string
  suburb?: string
  timezone?: Timezone
}
