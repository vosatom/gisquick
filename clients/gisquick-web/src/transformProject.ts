import type { ProjectConfig } from '@/store/interfaces'

function layersList(node) {
  return node.layers ? [].concat(...node.layers.map(layersList)) : [node]
}

export function transformProject(data: ProjectConfig) {
  // CUSTOM: Update Geoserver url to use WMS and use it as tile cache
  const overlayLayersList = layersList({ layers: data.layers })
  overlayLayersList.forEach((layer) => {
    if (layer.type === 'RasterLayer' && layer.source?.url.includes('geoserver1.prahounakole.cz/geoserver')) {
      layer.custom.clientLayer = 'wms'
      layer.tiled = true
      layer.source.url = layer.source.url.replace('wmts', 'wms')
    }
  })

  return data
}
