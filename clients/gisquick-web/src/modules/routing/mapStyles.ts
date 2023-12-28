import type { Feature } from 'ol'
import { Style, Stroke, Fill, Circle, Icon } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import type { StyleFunction } from 'ol/style/Style'

import { QueryPointType, type QueryPoint } from './store'

import poiIcon from '@/assets/mnk/poi.png?url'
import poiIconFrom from '@/assets/mnk/poi_from.png?url'
import poiIconTo from '@/assets/mnk/poi_to.png?url'
import poiIconWaypoint from '@/assets/mnk/poi_waypoint.png?url'
import { cssColor, hexToRgb } from '@/ui/utils/colors'

export const queryPointsStyle: StyleFunction = (feature) => {
  let color = '#000'
  const data = feature.get('data') as QueryPoint
  if (!data) {
    return new Style({
      image: new Circle({ fill: new Fill({ color: color }), radius: 10 }),
    })
  }

  let icon = poiIconWaypoint
  if (data.type === QueryPointType.Start) {
    color = 'rgb(19 195 43)'
    icon = poiIconFrom
  } else if (data.type === QueryPointType.End) {
    color = 'rgb(209 68 28)'
    icon = poiIconTo
  }

  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: icon,
    }),
  })
}

export const selectedPathStyle = (color = '#0a58ca') => [
  new Style({
    zIndex: 1,
    stroke: new Stroke({
      color: cssColor(hexToRgb(color, 0.6)),
      width: 10,
    }),
  }),
]

export const otherPathStyle = (color = '#000') =>
  new Style({
    stroke: new Stroke({
      color: cssColor(hexToRgb(color, 0.5)),
      width: 6,
      lineCap: 'round',
      lineJoin: 'round',
    }),
  })

export const pathStyle: StyleFunction = (feature) => {
  return feature.get('isActive')
    ? selectedPathStyle(feature.get('pathColor'))
    : otherPathStyle(feature.get('pathColor'))
}

export const tempPathStyle = new Style({
  stroke: new Stroke({
    color: '#ff9900',
    width: 6,
    lineCap: 'round',
    lineJoin: 'round',
  }),
})

export const accessPointsStyle = new Style({
  stroke: new Stroke({
    color: '#275DAD',
    width: 4,
    lineDash: [1, 10],
    lineCap: 'round',
    lineJoin: 'round',
  }),
})

export const cursorStyle = new Style({
  image: new Circle({
    fill: new Fill({ color: 'rgb(191,156,94)' }),
    radius: 8,
    stroke: new Stroke({
      color: 'rgba(255,255,255,1)',
      width: 2,
    }),
  }),
})

export const poiStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: poiIcon,
  }),
})
export const pathCursorStyle = new Style({
  image: new Icon({
    anchor: [0.3, 1],
    src: poiIconWaypoint,
  }),
})

export const elevationProfileCursorStyle = pathCursorStyle

export const instructionHoverStyle = (feature: Feature) => {
  const color = feature.get('pathColor') ?? '#3030ab'
  return new Style({
    image: new Circle({ fill: new Fill({ color }), radius: 8 }),
    stroke: new Stroke({ color, width: 8 }),
  })
}

export const debugStyle = new Style({
  image: new Circle({
    fill: new Fill({ color: 'rgb(255,0,0)' }),
    radius: 12,
  }),
})

export const pointStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: poiIcon,
  }),
})

const image = pointStyle.getImage()

const width = 5
const color = 'green'

const fill = new Fill({
  color: 'rgba(0, 255, 0, 0.1)',
})

const stroke = new Stroke({
  color: color,
  width: width,
})

const styles = {
  Point: new Style({ image: image }),
  LineString: new Style({ stroke }),
  MultiLineString: new Style({ stroke }),
  MultiPoint: new Style({ image: image }),
  MultiPolygon: new Style({ stroke, fill }),
  Polygon: new Style({ stroke, fill }),
  GeometryCollection: new Style({
    stroke,
    fill,
    image: new CircleStyle({ radius: 10, fill: null, stroke }),
  }),
  Circle: new Style({ stroke, fill }),
}

export const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()]
}

export const isolineStyle: StyleFunction = (feature) => {
  const color = feature.get('color')
  const alphaColor = hexToRgb(color)
  alphaColor[3] = 0.2
  return new Style({
    fill: new Fill({
      color: alphaColor,
    }),
    stroke: new Stroke({
      color: color,
      width: 2,
    }),
  })
}
