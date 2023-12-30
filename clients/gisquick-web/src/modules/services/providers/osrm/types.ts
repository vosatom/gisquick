export interface OSRMRouteResult {
  code: string
  routes: Route[]
  waypoints: Waypoint[]
}

export interface Route {
  legs: Leg[]
  weight_name: string
  weight: number
  duration: number
  distance: number
}

export interface Leg {
  steps: Step[]
  summary: string
  weight: number
  duration: number
  distance: number
}

export interface Step {
  geometry: string
  maneuver: Maneuver
  mode: Mode
  driving_side: DrivingSide
  name: string
  intersections: Intersection[]
  weight: number
  duration: number
  distance: number
  ref?: string
}

export enum DrivingSide {
  Left = 'left',
  Right = 'right',
  SharpRight = 'sharp right',
  SlightLeft = 'slight left',
  SlightRight = 'slight right',
  Straight = 'straight',
}

export interface Intersection {
  out?: number
  entry: boolean[]
  bearings: number[]
  location: number[]
  in?: number
  classes?: string[]
}

export interface Maneuver {
  bearing_after: number
  bearing_before: number
  location: number[]
  modifier: DrivingSide
  type: Type
  exit?: number
}

export enum Type {
  Arrive = 'arrive',
  Continue = 'continue',
  Depart = 'depart',
  EndOfRoad = 'end of road',
  ExitRoundabout = 'exit roundabout',
  Fork = 'fork',
  NewName = 'new name',
  Roundabout = 'roundabout',
  Turn = 'turn',
}

export enum Mode {
  Cycling = 'cycling',
}

export interface Waypoint {
  hint: string
  distance: number
  name: string
  location: number[]
}
