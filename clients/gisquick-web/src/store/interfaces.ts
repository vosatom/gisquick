export interface App {
  lang: Lang
  landing_project: string
  reset_password_url: string
}

export type Lang = string

export interface AttributeTable {
  limit: number
  visibleAreaFilter: boolean
  layer: null
  filters: Filters
  features: any[]
}

export interface Filters {}

export interface Project {
  config: ProjectConfig
  baseLayers: BaseLayers
  overlays: Overlays
}

export interface BaseLayers {
  groups: TreeElement[]
  tree: TreeElement[]
  list: BaseLayer[]
}

export interface TreeElement {
  layers: BaseLayer[]
  mutually_exclusive: boolean
  name: string
}

export interface BaseLayer {
  name: string
  title: string
  type: TreeType
  projection: ProjectionCode
  metadata: Metadata
  extent: number[]
  provider_type: ProviderType
  source: Source
  visible: boolean
  url: string
  format: Format
  wms_layers: string[] | null
}

export type Format = string

export interface Metadata {
  abstract: string
  keyword_list: string
}

export type ProjectionCode = string

export type ProviderType = string

export interface Source {
  crs: CRS
  type?: SourceType
  url: string
  zmax?: string
  zmin?: string
  dpiMode?: string
  format?: Format
  layers?: string
  tilePixelRatio?: string
}

export type CRS = string

export type SourceType = string

export enum TreeType {
  RasterLayer = 'RasterLayer',
  VectorLayer = 'VectorLayer',
}

export interface ProjectConfig {
  base_layers: TreeElement[]
  layers: TreeClass[]
  name: string
  ows_project: string
  ows_url: string
  print_composers: any[]
  project_extent: number[]
  projection: ProjectionCode
  projections: { [key: string]: ProjectionValue }
  root_title: string
  scales: number[]
  scripts: null
  status: number
  tile_resolutions: number[]
  topics: Topic[]
  units: Units
  use_mapcache: boolean
  zoom_extent: number[]

  description: string
  bookmarks: Record<string, Record<string, Bookmark>>
}

export interface Bookmark {
  id: string
  name: string
  /** Rotation in degrees */
  rotation: number
  /** Extent in project's projection */
  extent: number[]
  /** Users content */
  content?: string
}

export interface Topic {
  id: string
  title: string
  abstract: string
  visible_overlays: string[]
}
export interface TreeClass {
  name: string
  title?: string
  type?: TreeType
  projection?: ProjectionCode
  metadata?: Metadata
  attribution?: Attribution
  bands?: Band[]
  drawing_order?: number
  visible?: boolean
  hidden?: boolean
  queryable?: boolean
  permissions?: Permissions
  layers?: LayerList[]
  mutually_exclusive?: boolean
}

export interface Attribution {
  title: string
  url: string
}

export type Band = string

export interface LayerList {
  layers?: ListLayer[]
  mutually_exclusive?: boolean
  name: string
  title?: string
  type?: TreeType
  projection?: ProjectionCode
  metadata?: Metadata
  drawing_order?: number
  visible?: boolean
  hidden?: boolean
  queryable?: boolean
  wkb_type?: WkbTypeEnum
  permissions?: Permissions
  attributes?: Attribute[]
  attr_table_fields?: string[]
  info_panel_fields?: string[]
  bands?: Band[]
  clientLayer?: boolean
  legend_url?: string
  attribution?: Attribution
  relations: Relation[]
  provider_type?: 'wms' | 'xyz'
  custom?: any
}

export interface Relation {
  name: string
  referencing_layer: string
  strength: 0
  referencing_fields: string[]
  referenced_fields: string[]
}

export interface Attribute {
  name: string
  type: AttributeType
  widget?: Widget
  config?: AttributeConfig
  constrains?: Constrain[]
}

export interface AttributeConfig {
  map?: { [key: string]: number }[]
  IsMultiline?: boolean
  UseHtml?: boolean
  AllowNull?: boolean
  Max?: number
  Min?: number
  Precision?: number
  Step?: number
  Style?: Style
  operations?: string[]
  value?: 'user' | 'current_datetime' | 'current_date'
  field_format?: string
}

export enum Style {
  SpinBox = 'SpinBox',
}

export enum Constrain {
  NotNull = 'not_null',
  Readonly = 'readonly',
  Unique = 'unique',
}

export enum AttributeType {
  Empty = '',
  Bool = 'bool',
  Datetime = 'datetime',
  Float = 'float',
  Int = 'int',
  Text = 'text',
}

export enum Widget {
  CheckBox = 'CheckBox',
  DateTime = 'DateTime',
  Hyperlink = 'Hyperlink',
  Image = 'Image',
  KeyValue = 'KeyValue',
  Range = 'Range',
  TextEdit = 'TextEdit',
  TextField = 'TextField',
  ValueMap = 'ValueMap',
  Autofill = 'Autofill',
}

export interface ListLayer {
  name: string
  title: string
  type: TreeType
  projection: ProjectionCode
  metadata: Metadata
  drawing_order: number
  visible: boolean
  hidden: boolean
  queryable: boolean
  wkb_type: WkbTypeEnum
  permissions: Permissions
}

export interface Permissions {
  view: boolean
  insert: boolean
  update: boolean
  delete: boolean
  edit_geom: boolean
}

export enum WkbTypeEnum {
  GeometryCollection = 'GeometryCollection',
  LineString = 'LineString',
  MultiCurve = 'MultiCurve',
  MultiLineString = 'MultiLineString',
  MultiPoint = 'MultiPoint',
  Point = 'Point',
  Polygon = 'Polygon',
}

export interface ProjectionValue {
  proj4: string
  is_geographic: boolean
}

export interface Units {
  area: string
  distance: string
  factor: number
  map: string
  position_precision: number
}

export interface Overlays {
  groups: OverlaysGroup[]
  tree: TreeClass[]
  list: LayerList[]
}

export interface OverlaysGroup {
  layers: LayerList[]
  mutually_exclusive: boolean
  name: string
  visible: boolean
}

export interface User {
  username: string
  email: string
  first_name: string
  last_name: string
  is_superuser: boolean
  is_guest: boolean
}

export interface Location {}
