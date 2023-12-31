import { intlFormat } from 'date-fns'

export function formatDate(date: Date) {
  return intlFormat(
    date,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    { locale: 'cs-CZ' },
  )
}
