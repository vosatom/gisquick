import type { Map } from 'ol'
import type { Layer } from 'ol/layer'
import LayerGroup from 'ol/layer/Group'
import ImageLayer from 'ol/layer/Image'
import TileLayer from 'ol/layer/Tile'
import { ImageWMS, TileWMS, WMTS, XYZ } from 'ol/source'
import type { Options as SourceOptions } from 'ol/source/TileWMS'

import { wmtsSource } from '@/map/wmts'
import type { MapConfig } from '@/modules/types/config'

/**
 * Add client layers
 *
 * Primarily used to load WMS layers directly in browser to prevent fetching on QGIS server
 */
export async function createClientLayers(map: Map, config: MapConfig) {
  const newLayers: Layer[] = []
  const layers = config.overlays.filter((l) => l.custom?.clientLayer)

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i]

    if (layer.type === 'RasterLayer') {
      let source: TileWMS | ImageWMS | XYZ | WMTS | undefined
      const sourceParams = layer.source

      if (layer.provider_type === 'wms') {
        const options: SourceOptions = {
          url: sourceParams.url,
          params: {
            LAYERS: sourceParams.layers,
            SRS: sourceParams.crs,
            STYLES: sourceParams.styles,
          },
          ratio: 1,
          serverType: 'geoserver',
        }

        if (sourceParams.tileMatrixSet) {
          source = await wmtsSource(config.project, layer)
        } else if (layer.custom.tiled) {
          options.params.TILED = true
          source = new TileWMS(options)
        } else {
          source = new ImageWMS(options)
        }
      } else if (layer.provider_type === 'xyz') {
        source = new XYZ({
          url: sourceParams.url,
        })
      }

      let newLayer
      if (source) {
        if (
          source instanceof TileWMS ||
          source instanceof XYZ ||
          source instanceof WMTS
        ) {
          newLayer = new TileLayer({
            visible: layer.visible,
            source,
          })
        } else {
          newLayer = new ImageLayer({
            visible: layer.visible,
            source,
          })
        }
        newLayer.set('name', layer.name)
        newLayers.push(newLayer)
      }
    }
  }

  return newLayers
}

export async function createClientLayer(map: Map, config: MapConfig) {
  return new LayerGroup({
    layers: await createClientLayers(map, config),
  })
}
