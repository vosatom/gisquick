import { describe, expect, test } from 'vitest'

import {
  getInstructionsDetails,
  getItemsInInterval,
} from './getInstructionsDetails'

describe('getAllThatMatchInterval', () => {
  test('getAllThatMatchInterval (1)', () => {
    const intervals = [
      [0, 1, 'a'],
      [1, 2, 'b'],
      [2, 3, 'c'],
      [3, 4, 'd'],
    ]
    const interval = [1, 3]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['b', 'c'])
  })

  test('getAllThatMatchInterval (2)', () => {
    const intervals = [
      [0, 1, 'a'],
      [1, 2, 'b'],
      [2, 3, 'c'],
      [3, 4, 'd'],
    ]
    const interval = [1, 2]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['b'])
  })

  test('getAllThatMatchInterval (3)', () => {
    const intervals = [
      [0, 1, 'a'],
      [1, 2, 'b'],
      [2, 3, 'c'],
      [3, 4, 'd'],
    ]
    const interval = [0, 1]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['a'])
  })
  test('getAllThatMatchInterval (4)', () => {
    const intervals = [
      [0, 3, 'a'],
      [3, 4, 'd'],
    ]
    const interval = [0, 1]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['a'])
  })
  test('getAllThatMatchInterval (5)', () => {
    const intervals = [
      [0, 1, 'a'],
      [1, 2, 'b'],
      [2, 3, 'c'],
      [3, 4, 'd'],
    ]
    const interval = [2, 3]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['c'])
  })
  test('getAllThatMatchInterval (6)', () => {
    const intervals = [[0, 1, 'a']]
    const interval = [0, 1]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['a'])
  })
  test('getAllThatMatchInterval (7)', () => {
    const intervals = [
      [0, 1, 'a'],
      [1, 3, 'b'],
      [3, 4, 'c'],
    ]
    const interval = [2, 4]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['b', 'c'])
  })
  test('getAllThatMatchInterval (8)', () => {
    const intervals = [
      [0, 2, 'footway'],
      [2, 4, 'residential'],
      [4, 9, 'secondary'],
      [9, 11, 'footway'],
      [11, 36, 'cycleway'],
      [36, 37, 'steps'],
      [37, 38, 'cycleway'],
      [38, 39, 'steps'],
      [39, 40, 'cycleway'],
      [40, 41, 'footway'],
      [41, 46, 'tertiary'],
      [46, 50, 'service'],
      [50, 55, 'residential'],
      [55, 64, 'pedestrian'],
      [64, 76, 'residential'],
      [76, 87, 'tertiary'],
      [87, 90, 'residential'],
    ]
    const interval = [26, 40]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual([
      'cycleway',
      'steps',
      'cycleway',
      'steps',
      'cycleway',
    ])
  })
  test('getAllThatMatchInterval (9)', () => {
    const intervals = [
      [11, 34, 'cycleway'],
      [36, 39, 'steps'],
      [87, 90, 'residential'],
    ]
    const interval = [36, 39]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['steps'])
  })
  test('getAllThatMatchInterval (10)', () => {
    const intervals = [
      [11, 34, 'cycleway'],
      [36, 39, 'steps'],
      [87, 90, 'residential'],
    ]
    const interval = [11, 39]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual(['cycleway', 'steps'])
  })
  test('getAllThatMatchInterval (11)', () => {
    const intervals = [
      [11, 34, 'cycleway'],
      [36, 39, 'steps'],
      [87, 90, 'residential'],
    ]
    const interval = [45, 70]
    const [result] = getItemsInInterval(
      intervals,
      interval,
      0,
      intervals.length,
    )
    expect(result).toEqual([])
  })
})

describe('getInstructionsDetails', () => {
  test('one detail category', () => {
    const details = {
      road_class: [
        [0, 2, 'footway'],
        [2, 4, 'residential'],
        [4, 9, 'secondary'],
        [9, 11, 'footway'],
        [11, 36, 'cycleway'],
        [36, 37, 'steps'],
        [37, 38, 'cycleway'],
        [38, 39, 'steps'],
        [39, 40, 'cycleway'],
        [40, 41, 'footway'],
        [41, 46, 'tertiary'],
        [46, 50, 'service'],
        [50, 55, 'residential'],
        [55, 64, 'pedestrian'],
        [64, 76, 'residential'],
        [76, 87, 'tertiary'],
        [87, 90, 'residential'],
      ],
    }
    const instructions = [
      { interval: [0, 1] },
      { interval: [1, 2] },
      { interval: [2, 3] },
      { interval: [3, 4] },
      { interval: [4, 9] },
      { interval: [9, 10] },
      { interval: [10, 11] },
      { interval: [11, 17] },
      { interval: [17, 26] },
      { interval: [26, 40] },
      { interval: [40, 41] },
      { interval: [41, 44] },
      { interval: [44, 49] },
      { interval: [49, 55] },
      { interval: [55, 56] },
      { interval: [56, 63] },
      { interval: [63, 68] },
      { interval: [68, 76] },
      { interval: [76, 79] },
      { interval: [79, 87] },
      { interval: [87, 89] },
      { interval: [89, 90] },
      { interval: [90, 90] },
    ]

    const result = getInstructionsDetails(instructions, details)

    expect(result).toEqual({
      road_class: [
        ['footway'],
        ['footway'],
        ['residential'],
        ['residential'],
        ['secondary'],
        ['footway'],
        ['footway'],
        ['cycleway'],
        ['cycleway'],
        ['cycleway', 'steps', 'cycleway', 'steps', 'cycleway'],
        ['footway'],
        ['tertiary'],
        ['tertiary', 'service'],
        ['service', 'residential'],
        ['pedestrian'],
        ['pedestrian'],
        ['pedestrian', 'residential'],
        ['residential'],
        ['tertiary'],
        ['tertiary'],
        ['residential'],
        ['residential'],
        [],
      ],
    })
  })

  test('mixed categories', () => {
    const details = {
      road_class: [
        [0, 2, 'footway'],
        [2, 4, 'residential'],
        [4, 9, 'secondary'],
        [9, 11, 'footway'],
        [11, 36, 'cycleway'],
        [36, 37, 'steps'],
        [37, 38, 'cycleway'],
        [38, 39, 'steps'],
      ],
      b: [
        [0, 2, 'footway'],
        [2, 4, 'residential'],
        [4, 9, 'secondary'],
        [9, 11, 'footway'],
        [11, 36, 'cycleway'],
        [36, 37, 'steps'],
        [37, 38, 'cycleway'],
        [38, 39, 'steps'],
      ],
    }
    const instructions = [
      { interval: [0, 1] },
      { interval: [1, 2] },
      { interval: [2, 3] },
      { interval: [3, 4] },
      { interval: [4, 9] },
      { interval: [9, 10] },
      { interval: [10, 11] },
      { interval: [11, 17] },
      { interval: [17, 39] },
    ]

    const result = getInstructionsDetails(instructions, details)

    expect(result).toEqual({
      road_class: [
        ['footway'],
        ['footway'],
        ['residential'],
        ['residential'],
        ['secondary'],
        ['footway'],
        ['footway'],
        ['cycleway'],
        ['cycleway', 'steps', 'cycleway', 'steps'],
      ],
      b: [
        ['footway'],
        ['footway'],
        ['residential'],
        ['residential'],
        ['secondary'],
        ['footway'],
        ['footway'],
        ['cycleway'],
        ['cycleway', 'steps', 'cycleway', 'steps'],
      ],
    })
  })

  test('missing start 1', () => {
    const details = {
      get_off_bike: [[66, 72, true]],
    }
    const instructions = [
      { interval: [0, 5] },
      { interval: [5, 10] },
      { interval: [10, 14] },
      { interval: [14, 18] },
      { interval: [18, 29] },
      { interval: [29, 37] },
      { interval: [37, 44] },
      { interval: [44, 66] },
      { interval: [66, 72] },
    ]

    const result = getInstructionsDetails(instructions, details)

    expect(result).toEqual({
      get_off_bike: [[], [], [], [], [], [], [], [], [true]],
    })
  })

  test('missing start 2', () => {
    const details = {
      get_off_bike: [
        [41, 42, true],
        [43, 44, true],
        [88, 90, true],
      ],
    }
    const instructions = [
      { interval: [0, 4] },
      { interval: [4, 16] },
      { interval: [16, 18] },
      { interval: [18, 36] },
      { interval: [36, 41] },
      { interval: [41, 42] },
      { interval: [42, 43] },
      { interval: [43, 44] },
      { interval: [44, 45] },
      { interval: [45, 50] },
      { interval: [50, 56] },
      { interval: [56, 61] },
      { interval: [61, 65] },
      { interval: [65, 67] },
      { interval: [67, 70] },
      { interval: [70, 81] },
      { interval: [81, 88] },
      { interval: [88, 90] },
    ]

    const result = getInstructionsDetails(instructions, details)

    expect(result).toEqual({
      get_off_bike: [
        [],
        [],
        [],
        [],
        [],
        [true],
        [],
        [true],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [true],
      ],
    })
  })
})
