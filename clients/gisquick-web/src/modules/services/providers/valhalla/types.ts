export interface ValhallaRouteResult {
  trip: Trip
  id: string
}

export interface Trip {
  locations: Location[]
  legs: Leg[]
  summary: Summary
  status_message: string
  status: number
  units: string
  language: string
}

export interface Leg {
  maneuvers: Maneuver[]
  summary: Summary
  shape: string
}

export interface Maneuver {
  type: number
  instruction: string
  verbal_succinct_transition_instruction?: string
  verbal_pre_transition_instruction: string
  verbal_post_transition_instruction?: string
  street_names?: string[]
  time: number
  length: number
  cost: number
  begin_shape_index: number
  end_shape_index: number
  verbal_multi_cue?: boolean
  travel_mode: string
  travel_type: string
  verbal_transition_alert_instruction?: string
}

export interface Summary {
  has_time_restrictions: boolean
  has_toll: boolean
  has_highway: boolean
  has_ferry: boolean
  min_lat: number
  min_lon: number
  max_lat: number
  max_lon: number
  time: number
  length: number
  cost: number
}

export interface Location {
  type: string
  lat: number
  lon: number
  side_of_street: string
  original_index: number
}
