import WFS from 'ol/format/wfs'
import http from '@/client'

export function wfsTransaction (owsUrl, layername, { inserts = [], updates = [], deletes = [] }) {
  const wfs = new WFS()
  const opts = {
    featureNS: 'http://gisquick.org',
    featurePrefix: '',
    featureType: layername,
    version: '1.1.0'
  }
  const nodeEl = wfs.writeTransaction(inserts, updates, deletes, opts)
  const query = nodeEl.outerHTML
  const httpOpts = {
    params: {
      'VERSION': '1.1.0',
      'SERVICE': 'WFS'
    },
    headers: {
      'Content-Type': 'text/xml'
    }
  }
  return new Promise((resolve, reject) => {
    http.post(owsUrl, query, httpOpts)
      .then(resp => {
        const respXML = resp.request.responseXML
        if (!respXML) {
          throw new Error('Server error')
        }
        const check = {
          TotalInserted: inserts.length,
          TotalUpdated: updates.length,
          TotalDeleted: deletes.length
        }
        Object.entries(check)
          .filter(([tag, count]) => count > 0)
          .forEach(([tag, count]) => {
            const el = respXML.querySelector(tag)
            const value = el && parseInt(el.textContent)
            if (count !== value) {
              throw new Error('Data update error')
              // reject(new Error('Data update error'))
            }
          })
        resolve()
      })
      .catch(err => {
        if (err.response) {
          let msg = null
          if  (err.response.status === 403) {
            msg = 'Permission denied'
          } else if (err.response.request.responseXML) {
            const info = err.response.request.responseXML.querySelector('ServiceException')
            msg = info && info.textContent
          // const el = respXML.querySelector('Message')
          // const err = msg && msg.textContent
          }
          // if (err.response.headers['content-type'] == 'application/json')
          return reject(new Error(msg || 'Error'))
        }
        reject(err)
      })
  })
}
