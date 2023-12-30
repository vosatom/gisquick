import type { Point } from '@turf/helpers'

export interface AutocompletePayload {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  category: string
  type: string
  place_rank: number
  importance: number
  addresstype: string
  name: string
  display_name: string
  boundingbox: string[]
}

export interface AutocompleteLookupPayload {
  place_id: number
  parent_place_id: number
  osm_type: string
  osm_id: number
  category: string
  type: string
  admin_level: number
  localname: string
  country_code: string
  indexed_date: Date
  importance: number
  calculated_importance: number
  calculated_wikipedia: string
  rank_address: number
  rank_search: number
  isarea: boolean
  centroid: Point
  geometry: Geometry
  icon: string
}

export interface ReverseGeocodePayload {
  type: 'FeatureCollection'
  licence: string
  features: Feature[]
}

interface Feature {
  type: 'Feature'
  properties: Properties
  bbox: number[]
  geometry: Geometry
}

interface Geometry {
  type: string
  coordinates: number[]
}

interface Properties {
  place_id: number
  osm_type: string
  osm_id: number
  place_rank: number
  category: string
  type: string
  importance: number
  addresstype: string
  name: string
  display_name: string
  address: Address
}

interface Address {
  road: string
  quarter: string
  suburb: string
  city: string
  state: string
  postcode: string
  country: string
  country_code: string
}
