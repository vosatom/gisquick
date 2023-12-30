import { format } from 'date-fns'

import type { RouteResult } from './types'

const CREATOR = 'gisquick'

function getGpxContent(
  data: RouteResult,
  pathIndex: number,
  metadata: { time: Date, trackName?: string },
) {
  const trackName = metadata.trackName ?? 'Track'
  const path = data.paths[pathIndex]

  const time = metadata.time.toISOString()

  const content = path.points.coordinates.map((point, index) => {
    let pointContent = ''
    if (typeof path.elevations[index] !== 'undefined') {
      pointContent += `<ele>${path.elevations[index]}</ele>`
    }
    return `<trkpt lat="${point[1]}" lon="${point[0]}">${pointContent}</trkpt>`
  }).join('\n')

  const result = `<?xml version="1.0" encoding="utf-8" ?>
  <gpx xmlns="http://www.topografix.com/GPX/1/1" creator="${CREATOR}" version="1.1">
    <metadata>
      <copyright author="${data.atribution.join(', ')}"/>
      <time>${time}</time>
    </metadata>
    <trk>
      <name>${trackName}</name>
      <trkseg>${content}</trkseg>
    </trk>
  </gpx>`

  return result
}

function createFileFromString(content: string, mimeType: string) {
  return new Blob([content], { type: mimeType })
}

function downloadFile(blob: Blob, fileName: string) {
  const a = window.document.createElement('a')
  window.document.body.appendChild(a)
  a.style.display = 'none'
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
}

export function downloadGpxFile(
  data: RouteResult,
  pathIndex: number,
  metadata: { time?: Date } = {},
) {
  const time = metadata.time ?? new Date()
  const content = getGpxContent(data, pathIndex, { time })
  const file = createFileFromString(content, 'application/gpx+xml')
  downloadFile(file, `route-${format(time, 'yyyyMMdd-HHmmss')}.gpx`)
}
