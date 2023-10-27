import type { BaseLayer, ProjectConfig } from '@/store/interfaces'

export interface MapConfig {
  project: Config['ows_project']
  baseLayers: BaseLayer[]
  overlays: OverlayLayer[]
  extent: Config['project_extent']
  projection: Config['projection']
  resolutions: Config['tile_resolutions']
  scales: Config['scales']
  owsUrl: Config['ows_url']
  legendUrl: Config['legend_url']
  mapcacheUrl: Config['mapcache_url']
}

interface ProjectConfig {
  custom: Custom
}

enum LayerType {
  RasterLayer = 'RasterLayer',
  VectorLayer = 'VectorLayer',
}

interface Custom {
  note: string
  routing: Routing
}

interface Routing {
  enabled: boolean
  isochronesEnabled: boolean
  services: Services
}

interface Services {
  graphhopper: boolean
  cyclestreets: boolean
}
