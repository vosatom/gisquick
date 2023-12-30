import Map from 'ol/Map'
import View from 'ol/View'
import ImageWMS from 'ol/source/ImageWMS'
import TileImage from 'ol/source/TileImage'
import TileWMS from 'ol/source/TileWMS'
// import BingMaps from 'ol/source/BingMaps'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import TileArcGISRest from 'ol/source/TileArcGISRest'
import ImageLayer from 'ol/layer/Image'
import TileLayer from 'ol/layer/Tile'
import TileGrid from 'ol/tilegrid/TileGrid'
import { getCenter, getBottomLeft } from 'ol/extent'
import { get as getProj } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { defaults as defaultControls } from 'ol/control'
// import md5 from 'md5'
import debounce from 'lodash/debounce'
import omitBy from 'lodash/omitBy'
import { wmtsSource } from './wmts'
import { createClientLayer, createClientLayers } from '@/modules/mnk/mapBuilder'
import LayerGroup from 'ol/layer/Group'


const cleanParams = params => omitBy(params, v => v === undefined || v === null || v === '')

function createUrl (baseUrl, params = {}) {
  const url = new URL(baseUrl, location.origin)
  Object.keys(params).forEach(k => url.searchParams.set(k, params[k]))
  return url
}

function GisquickWMSType (baseClass) {
  class GisquickWMS extends baseClass {
    constructor (opts) {
      super(opts)
      this.layersAttributions = opts.layersAttributions || {}
      this.layersOrder = opts.layersOrder || {}
      const legendParams = {
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetLegendGraphic',
        EXCEPTIONS: 'application/vnd.ogc.se_xml',
      }
      this.legendUrl = createUrl(opts.legendUrl ?? opts.url, legendParams)
      this.setVisibleLayers(opts.visibleLayers || [])
    }

    setVisibleLayers (layers) {
      const orderedLayers = [].concat(layers)
      orderedLayers.sort((l2, l1) => this.layersOrder[l1] - this.layersOrder[l2])
      // update attributions
      if (this.layersAttributions) {
        const attributions = orderedLayers.map(layername => this.layersAttributions[layername]).filter(v => v)
        this.setAttributions(attributions)
      }
      this.updateParams({ LAYERS: orderedLayers.join(',') })
      this.visibleLayers = orderedLayers
    }

    getVisibleLayers () {
      return this.visibleLayers
    }

    getLegendUrl (layername, view, opts) {
      this.legendUrl.searchParams.set('LAYER', layername)
      this.legendUrl.searchParams.set('SCALE', Math.round(view.getScale()))
      if (opts) {
        for (const [k, v] of Object.entries(opts)) {
          this.legendUrl.searchParams.set(k, v)
        }
      }
      return this.legendUrl.href
    }

    refresh () {
      // prevent caching in the browser by additional GET parameter updated on every change
      this.updateParams({ rev: this.getRevision() })
    }
  }
  return GisquickWMS
}

export const GisquickTileWMS = GisquickWMSType(TileWMS)
export const GisquickImageWMS = GisquickWMSType(ImageWMS)

function createAttribution (config) {
  const html = config.url
    ? `<a href="${config.url}" target="_blank">${config.title}</a>`
    : config.title
  return html
  // return new Attribution({ html })
}
export function createQgisLayer (config, projectConfig) {
  const visibleLayers = config.overlays.filter(l => l.visible && !l.clientLayer).map(l => l.name)
  const layersOrder = {}
  const attributions = {}

  config.overlays.forEach(layer => {
    layersOrder[layer.name] = layer.drawing_order
    if (layer.attribution) {
      attributions[layer.name] = createAttribution(layer.attribution)
    }
  })

  if (config.mapTiling) {
    const url = config.owsUrl

    return new TileLayer({
      visible: true,
      extent: config.extent,
      source: new GisquickTileWMS({
        url: config.owsUrl,
        legendUrl: config.owsUrl,
        params: {
          FORMAT: 'image/png',
          TRANSPARENT: 'true',
          TILED: 'true'
        },
        tileGrid: new TileGrid({
          origin: getBottomLeft(config.extent),
          resolutions: config.resolutions || projectConfig.resolutions,
          tileSize: 512
        }),
        visibleLayers: visibleLayers,
        layersAttributions: attributions,
        layersOrder: layersOrder,
        hidpi: false,
        interpolate: false
      })
    })
  } else {
    return new ImageLayer({
      visible: true,
      extent: config.extent,
      source: new GisquickImageWMS({
        resolutions: config.resolutions,
        url: config.owsUrl,
        visibleLayers: visibleLayers,
        layersAttributions: attributions,
        layersOrder: layersOrder,
        params: {
          FORMAT: 'image/png'
        },
        serverType: 'qgis',
        ratio: 1,
        interpolate: false,
        imageLoadFunction: debounce((image, src) => {
          image.getImage().src = src
        }, 90)
      })
    })
  }
}

export async function createBaseLayer (layerConfig, projectConfig = {}) {
  const { source, type, provider_type } = layerConfig
  const attributions = layerConfig.attribution ? [createAttribution(layerConfig.attribution)] : null
  const className = layerConfig.filter ? `ol-layerfilter-${layerConfig.filter}` : undefined

  if (type === 'blank') {
    return new ImageLayer({
      extent: layerConfig.extent
    })
  }
  if (type === 'osm') {
    return new TileLayer({
      className,
      source: new OSM()
    })
  }
  if (provider_type === 'vectortile') {
    const vc = await import('./vector-tile.js')
    return await vc.createLayer(layerConfig)
  }
  if (type === 'xyz' || source?.type === 'xyz') {
    return new TileLayer({
      className,
      source: new XYZ({
        url: layerConfig.url,
        attributions
      })
    })
  }
  if (provider_type === 'arcgismapserver') {
    // for cached tiles, check https://stackoverflow.com/questions/71393178/openlayers-tilearcgisrest-vs-xyz
    const { url, ...params } = layerConfig.source
    return new TileLayer({
      className,
      source: new TileArcGISRest({
        url,
        attributions,
        params: Object.entries(cleanParams(params)).reduce((r, [k, v]) => (r[k.toUpperCase()] = v, r), {})
      }),
      extent: layerConfig.extent
    })
  }
  if (type === 'wms' || provider_type === 'wms') {
    let olSource
    if (source.tileMatrixSet) {
      // const wmts = await import('./wmts.js')
      // olSource = await wmts.wmtsSource(projectConfig.project, layerConfig, attributions)
      olSource = await wmtsSource(projectConfig.project, layerConfig, attributions)
    } else {
      olSource = new TileWMS({
        url: layerConfig.url,
        params: cleanParams({
          LAYERS: layerConfig.wms_layers.join(','),
          FORMAT: layerConfig.format,
          TRANSPARENT: 'false'
        }),
        attributions,
        tileGrid: new TileGrid({
          origin: getBottomLeft(layerConfig.extent),
          resolutions: layerConfig.resolutions || projectConfig.resolutions,
          tileSize: 512
        }),
        hidpi: false
      })
    }
    return new TileLayer({
      className,
      source: olSource,
      extent: layerConfig.extent
    })
  }
  /* else if (type === 'bing') {
    return new TileLayer({
      preload: Infinity,
      source: new BingMaps({
        key: layerConfig.apiKey,
        imagerySet: layerConfig.imagerySet,
        // use maxZoom 19 to see stretched tiles instead of the BingMaps "no photos at this zoom level" tiles
        maxZoom: 19
      })
    })
  } */
  // fallback to render layer by qgis server
  return new ImageLayer({
    className,
    extent: layerConfig.extent,
    source: new GisquickImageWMS({
      resolutions: layerConfig.resolutions || projectConfig.resolutions,
      url: projectConfig.owsUrl,
      visibleLayers: [layerConfig.name],
      layersAttributions: layerConfig.attributions,
      params: cleanParams({
        LAYERS: layerConfig.name,
        FORMAT: layerConfig.format,
        TRANSPARENT: 'false'
      }),
      serverType: 'qgis',
      ratio: 1
    })
  })
}

/**
 * @param {Object} config
 * @param {Array<Object>} config.baseLayers base layers
 * @param {Array<Object>} config.overlays overlay layers
 * @param {Object} config.projection as { code, proj4 }
 * @param {Array<number>} config.extent map extent
 * @param {Array<number>} config.resolutions map tile resolutions
 * @param {Array<number>} config.scales map scales
 * @param {String} config.owsUrl mapserver url
 * @param {String} config.legendUrl legend url
 * @param {String} config.mapcacheUrl mapcache url for cached overlays
 * @param {String} config.project ows project name
 * @param {Object} controlOpts ol control options
 * @returns {import('ol/Map').default}
 */
export function createMap (config, controlOpts = {}, visibleLayers, projectConfig = {}) {
  const projection = getProj(config.projection)
  if (!projection) {
    throw new Error(`Invalid or unknown map projection: ${config.projection}`)
  }

  let layers = []
  const overlay = createQgisLayer(config, projectConfig)
  layers.push(overlay)

  const map = new Map({
    layers,
    view: new View({
      projection: projection,
      center: getCenter(config.extent),
      zoom: 0,
      resolutions: config.resolutions,
      constrainResolution: true,
      extent: projection.getExtent() || config.extent,
      constrainOnlyCenter: true,
      smoothExtentConstraint: false
    }),
    controls: defaultControls(controlOpts),
    moveTolerance: 10
  })

  
  const clientLayer = new LayerGroup({
    layers: [],
  })
  map.clientLayer = clientLayer
  map.addLayer(map.clientLayer)
  createClientLayers(map, config, visibleLayers)
    .then((clientLayers) => {
      clientLayers.forEach(layer => clientLayer.getLayers().push(layer))
    })
    .catch((err) => {
      console.error(err);
    })

  map.overlay = overlay

  const baseLayers = {}
  map.getBaseLayer = async (name) => {
    if (!baseLayers[name]) {
      const layerConfig = config.baseLayers.find(c => c.name === name)
      const baseLayer = await createBaseLayer(layerConfig, config)
      baseLayer.set('type', 'baselayer')
      baseLayer.set('name', layerConfig.name)
      map.getLayers().insertAt(0, baseLayer)
      baseLayers[name] = baseLayer
    }
    return baseLayers[name]
  }

  // define getScale method for map's view object
  // (using scales from project metadata)
  const resolutionsToScales = {}
  config.resolutions.forEach((res, index) => {
    resolutionsToScales[res] = config.scales[index]
  })
  map.getView().getScale = function () {
    return resolutionsToScales[this.getResolution()]
  }

  return map
}

export function registerProjections (projections) {
  Object.entries(projections).forEach(([code, def]) => {
    if (code && !getProj(code)) {
      proj4.defs(code, def.proj4)
    }
  })
  register(proj4)
}
