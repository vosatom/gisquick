export interface DirectionsResult {
  marker: { '@attributes': Route | Segment }[]
  waypoint: { '@attributes': Waypoint }[]
}

interface DirectionsResultError {
  error: string
}

export type DirectionsPayload = DirectionsResult | DirectionsResultError

export interface Route {
  start: string
  finish: string
  start_longitude: string
  start_latitude: string
  finish_longitude: string
  finish_latitude: string
  crow_fly_distance: string
  event: string
  whence: string
  speed: string
  itinerary: string
  plan: string
  note: string
  length: string
  time: string
  busynance: string
  quietness: string
  signalledJunctions: string
  signalledCrossings: string
  west: string
  south: string
  east: string
  north: string
  name: string
  walk: string
  leaving: string
  arriving: string
  coordinates: string
  elevations: string
  distances: string
  grammesCO2saved: string
  calories: string
  edition: string
  type: 'route'
}

export interface Segment {
  name: string
  legNumber: string
  distance: string
  time: string
  busynance: string
  quietness: string
  flow: string
  walk: string
  signalledJunctions: string
  signalledCrossings: string
  turn: string
  startBearing: string
  color: string
  points: string
  distances: string
  elevations: string
  provisionName: string
  type: 'segment'
}

export interface Waypoint {
  longitude: string
  latitude: string
  sequenceId: string
}
