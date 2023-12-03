import type { ServicesConfig } from '@/modules/services/types'
import type { BaseLayer, LayerList, ProjectConfig } from '@/store/interfaces'

export interface MapConfig {
  project: ProjectConfig['ows_project']
  baseLayers: BaseLayer[]
  overlays: LayerList[]
  extent: ProjectConfig['project_extent']
  projection: ProjectConfig['projection']
  resolutions: ProjectConfig['tile_resolutions']
  scales: ProjectConfig['scales']
  owsUrl: ProjectConfig['ows_url']
  legendUrl: ProjectConfig['legend_url']
  mapcacheUrl: ProjectConfig['mapcache_url']

  services: ServicesConfig
}

export interface Topic {
  id: string
  title: string
  abstract: string
  visible_overlays: string[]
}

enum LayerType {
  RasterLayer = 'RasterLayer',
  VectorLayer = 'VectorLayer',
}

interface Custom {
  note: string
}

export interface LegendItem {
  name: string
  en_name: string
  image_url: string
  desc: string
}
