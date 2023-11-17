import path from 'path'
const translations = import.meta.glob('./assets/i18n/*.json', { eager: true, as: 'raw' })

export default Object.keys(translations).reduce((data, fname) => {
  data[path.basename(fname).replace('.json', '')] = JSON.parse(translations[fname])
  return data
}, {})
