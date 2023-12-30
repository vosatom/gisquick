import type { Feature, Polygon } from '@turf/helpers'

export interface GraphHopperRouteResult {
  hints: Hints
  info: Info
  paths: Path[]
}

interface Hints {
  'visited_nodes.sum': number
  'visited_nodes.average': number
}

interface Info {
  copyrights: string[]
  took: number
}

export interface Path {
  distance: number
  weight: number
  time: number
  transfers: number
  points_encoded: boolean
  bbox: number[]
  /** encoded points */
  points: string
  instructions: Instruction[]
  legs: any[]
  details: Details
  ascend: number
  descend: number
  snapped_waypoints: string
}

type Details = Partial<
  Record<
    | 'country'
    | 'max_weight'
    | 'max_width'
    | 'toll'
    | 'hazmat'
    | 'hazmat_tunnel'
    | 'hazmat_water'
    | 'lanes'
    | 'surface'
    | 'hike_rating'
    | 'mtb_rating'
    | 'foot_network'
    | 'street_name'
    | 'street_ref'
    | 'street_destination'
    | 'roundabout'
    | 'time'
    | 'distance'
    | 'max_speed'
    | 'road_class'
    | 'road_class_link'
    | 'road_access'
    | 'road_environment'
    | 'smoothness'
    | 'bike_network'
    | 'get_off_bike',
    [number, number, string][]
  >
>

export interface Instruction {
  street_ref?: string
  distance: number
  heading?: number
  sign: number
  interval: number[]
  text: string
  time: number
  street_name: string
  last_heading?: number
}

export interface IsolinePayload {
  info: Info
  polygons: Feature<Polygon, { bucket: number }>[]
}
