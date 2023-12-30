import type {
  FeatureCollection,
  Geometry,
  Feature,
  LineString,
  Polygon,
  Properties,
} from '@turf/helpers'
import type { Coordinate } from 'ol/coordinate'
import type { GeometryCollection } from 'ol/geom'

interface FeatureCollectionWithRaw<
  G = Geometry | GeometryCollection,
  P = Properties,
  Raw = object,
> extends FeatureCollection<G, P> {
  raw: Raw
}

export type SignName =
  | 'arrive_straight'
  | 'arrive_left'
  | 'arrive_right'
  | 'arrive'
  | 'close'
  | 'continue_left'
  | 'continue_right'
  | 'continue_slight_left'
  | 'continue_slight_right'
  | 'continue_straight'
  | 'continue_uturn'
  | 'continue'
  | 'depart_left'
  | 'depart_right'
  | 'depart_straight'
  | 'depart'
  | 'end_of_road_left'
  | 'end_of_road_right'
  | 'flag'
  | 'fork_left'
  | 'fork_right'
  | 'fork_slight_left'
  | 'fork_slight_right'
  | 'fork_straight'
  | 'fork'
  | 'invalid_left'
  | 'invalid_right'
  | 'invalid_slight_left'
  | 'invalid_slight_right'
  | 'invalid_straight'
  | 'invalid_uturn'
  | 'invalid'
  | 'merge_left'
  | 'merge_right'
  | 'merge_slight_left'
  | 'merge_slight_right'
  | 'merge_straight'
  | 'new_name_left'
  | 'new_name_right'
  | 'new_name_sharp_left'
  | 'new_name_sharp_right'
  | 'new_name_slight_left'
  | 'new_name_slight_right'
  | 'new_name_straight'
  | 'notification_left'
  | 'notification_right'
  | 'notification_sharp_left'
  | 'notification_sharp_right'
  | 'notification_slight_left'
  | 'notification_slight_right'
  | 'notification_straight'
  | 'off_ramp_left'
  | 'off_ramp_right'
  | 'off_ramp_slight_left'
  | 'off_ramp_slight_right'
  | 'on_ramp_left'
  | 'on_ramp_right'
  | 'on_ramp_sharp_left'
  | 'on_ramp_sharp_right'
  | 'on_ramp_slight_left'
  | 'on_ramp_slight_right'
  | 'on_ramp_straight'
  | 'rotary_left'
  | 'rotary_right'
  | 'rotary_sharp_left'
  | 'rotary_sharp_right'
  | 'rotary_slight_left'
  | 'rotary_slight_right'
  | 'rotary_straight'
  | 'rotary'
  | 'roundabout_left'
  | 'roundabout_right'
  | 'roundabout_sharp_left'
  | 'roundabout_sharp_right'
  | 'roundabout_slight_left'
  | 'roundabout_slight_right'
  | 'roundabout_straight'
  | 'roundabout'
  | 'turn_left'
  | 'turn_right'
  | 'turn_sharp_left'
  | 'turn_sharp_right'
  | 'turn_slight_left'
  | 'turn_slight_right'
  | 'turn_straight'
  | 'updown'
  | 'uturn'
  | 'unknown'

export interface RouteResult<Raw = object> {
  /** Directions provider */
  provider: string
  paths: Path[]
  atribution: string[]
  raw: Raw
}

export type RoutingDetailsCategories = 'road_class' | 'surface' | 'get_off_bike'

export interface Path {
  instructions: Instruction[]

  /** coordinates in GeoJSON */
  points: LineString

  /** Path elevations [meters] */
  elevations: number[]

  /** Path distances [meters] */
  distances: number[]

  /** Bounding extend in OL format ([minLon, minLat, maxLon, maxLat]) */
  bbox: number[]

  /** Total distance for path [meters] */
  distance: number

  /** Total time travelling for path [seconds] */
  time: number

  /** total descent [meters] */
  descend: number

  /** total ascent [meters] */
  ascend: number

  /** Path details, such as road_class, surface, ..
   *
   * road_class values should be OSM (https://wiki.openstreetmap.org/wiki/Key:highway)
   */
  details: Partial<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<RoutingDetailsCategories, [number, number, any][]>
  >

  /** Snapped waypoints */
  waypoints?: number[][]
}

export type Interval = [number, number]

export interface Instruction {
  /** Textual instruction */
  text: string

  /** TODO: Sign */
  sign: SignName

  /** distance [meters] */
  distance: number

  /** duration [seconds] */
  time: number

  /** TODO: interval */
  interval: Interval
}

export interface IsolineResult<Raw = object>
  extends FeatureCollectionWithRaw<Polygon, Record<string, unknown>, Raw> {}

interface AutocompleteItemProperties<P> {
  type: string
  title: string
  data?: P

  address?: string
  coordinate: Coordinate

  /** For some providers (such as WFS) */
  layerName?: string
}

export interface AutocompleteItem<Raw = object, P = object>
  extends FeatureCollectionWithRaw<
    Geometry,
    AutocompleteItemProperties<P>,
    Raw
  > {
  id: string
}

export interface AutocompleteResult<Raw = object, P = object>
  extends FeatureCollectionWithRaw<
    Geometry,
    AutocompleteItemProperties<P>,
    Raw
  > {}

export interface AutocompleteLookupResult<Raw = object, P = object>
  extends Feature<Geometry, AutocompleteItemProperties<P>> {
  raw: Raw
}

export interface GeocodeResult {}

export interface ReverseGeocodeResult<Raw = object, P = object>
  extends FeatureCollectionWithRaw<
    Geometry,
    { formatted: string; data: P },
    Raw
  > {}
