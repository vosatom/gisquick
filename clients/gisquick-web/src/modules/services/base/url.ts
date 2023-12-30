export function stringifyUrl({
  url,
  query,
}: {
  url: string
  query: Record<string, string | string[] | undefined | boolean | number>
}) {
  const parsedUrl = new URL(url, window.location.origin)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      parsedUrl.searchParams.set(key, String(value))
    }
  })
  return parsedUrl.toString()
}
