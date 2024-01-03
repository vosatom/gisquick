// https://github.com/perliedman/routing-components/blob/master/src/utils.js

const defaults = {
  unitNames: {
    meters: 'm',
    kilometers: 'km',
    miles: 'mi',
    yards: 'yd',
    hours: 'h',
    minutes: 'min',
    seconds: 's',
  },
  roundingSensitivity: 1,
  distanceTemplate: '{value} {unit}',
}

export function formatDistance(
  d: number,
  _sensitivity?: number,
  _options: {
    roundingSensitivity?: number
    unitNames?: (typeof defaults)['unitNames']
    units?: string
    distanceTemplate?: (typeof defaults)['distanceTemplate']
  } = {},
) {
  const options = _options || defaults
  const sensitivity =
    _sensitivity ?? options.roundingSensitivity ?? defaults.roundingSensitivity
  const un = options.unitNames ?? defaults['unitNames']
  const simpleRounding = sensitivity <= 0
  const roundFn: (v: number, sensitivity: number) => number = simpleRounding
    ? function (v) {
        return v
      }
    : round
  let data: { value: number | string; unit: string }

  if (options.units === 'imperial') {
    const yards = d / 0.9144
    if (yards >= 1000) {
      data = {
        value: roundFn(d / 1609.344, sensitivity),
        unit: un.miles,
      }
    } else {
      data = {
        value: roundFn(yards, sensitivity),
        unit: un.yards,
      }
    }
  } else {
    const v = roundFn(d, sensitivity)
    data = {
      value: v >= 1000 ? v / 1000 : v,
      unit: v >= 1000 ? un.kilometers : un.meters,
    }
  }

  if (simpleRounding) {
    data.value = data.value.toFixed(-sensitivity)
  }

  return (options.distanceTemplate ?? defaults.distanceTemplate)
    .replace('{unit}', data.unit)
    .replace('{value}', data.value)
}

function round(d: number, sensitivity: number) {
  const s = sensitivity,
    pow10 = Math.pow(10, (Math.floor(d / s) + '').length - 1),
    r = Math.floor(d / pow10),
    p = r > 5 ? pow10 : pow10 / 2

  return Math.round(d / p) * p
}

export function formatDuration(
  t: number,
  options?: {
    unitNames: (typeof defaults)['unitNames']
    roundingSensitivity?: number
    distanceTemplate?: string
  },
) {
  options = options || defaults
  const un = options.unitNames
  // More than 30 seconds precision looks ridiculous
  t = Math.round(t / 30) * 30
  const nonbr = ' '

  if (t > 86400) {
    return Math.round(t / 3600) + nonbr + un.hours
  } else if (t > 3600) {
    return (
      Math.floor(t / 3600) +
      nonbr +
      un.hours +
      nonbr +
      Math.round((t % 3600) / 60) +
      nonbr +
      un.minutes
    )
  } else if (t > 300) {
    return Math.round(t / 60) + nonbr + un.minutes
  } else if (t > 60) {
    return (
      Math.floor(t / 60) +
      nonbr +
      un.minutes +
      (t % 60 !== 0 ? nonbr + (t % 60) + nonbr + un.seconds : '')
    )
  } else {
    return t + nonbr + un.seconds
  }
}
