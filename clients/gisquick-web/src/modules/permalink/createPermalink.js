export function createPermalink(url, params) {
  const parsedUrl = new URL(url)
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      parsedUrl.searchParams.delete(key)
    } else {
      parsedUrl.searchParams.set(key, value)
    }
  })

  return parsedUrl.toString()
}
