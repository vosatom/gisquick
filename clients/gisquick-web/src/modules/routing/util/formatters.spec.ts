import { describe, expect, test } from 'vitest'

import { formatDistance, formatDuration } from './formatters'

describe('formatDistance', () => {
  test('formats distance in meters', () => {
    expect(formatDistance(100)).toBe('100 m')
    expect(formatDistance(1000)).toBe('1 km')
    expect(formatDistance(10000)).toBe('10 km')
    expect(formatDistance(100000)).toBe('100 km')
  })

  test('formats distance in yards', () => {
    expect(formatDistance(100, 0, { units: 'imperial' })).toBe('109 yd')
    expect(formatDistance(1000, 0, { units: 'imperial' })).toBe('1 mi')
    expect(formatDistance(10000, 0, { units: 'imperial' })).toBe('6 mi')
    expect(formatDistance(100000, 0, { units: 'imperial' })).toBe('62 mi')
  })

  test('sensitivity', () => {
    expect(formatDistance(123456, 1)).toBe('100 km')
    expect(formatDistance(123456, 10)).toBe('120 km')
    expect(formatDistance(123456, 100)).toBe('123 km')
  })

  test('rounding sensitivity', () => {
    expect(formatDistance(123.456, -1)).toBe('123.5 m')
    expect(formatDistance(123.456, -2)).toBe('123.46 m')
    expect(formatDistance(123.456, -3)).toBe('123.456 m')
  })
})

describe('formatDuration', () => {
  test('formats duration in seconds', () => {
    expect(formatDuration(100)).toBe('1 min 30 s')
    expect(formatDuration(1000)).toBe('17 min')
    expect(formatDuration(10000)).toBe('2 h 47 min')
    expect(formatDuration(100000)).toBe('28 h')
  })
})
