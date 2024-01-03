import type {
  Instruction,
  Path,
  RoutingDetailsCategories,
} from '@/modules/services/base/types'

export function getItemsInInterval<T>(
  items: any[][],
  interval: number[],
  startHint: number,
  endHint: number,
): [T[], number] {
  const result: T[] = []

  let currentIndex = startHint
  while (currentIndex < endHint) {
    const item = items[currentIndex]

    if (item[1] > interval[0]) {
      break
    }

    currentIndex++
  }

  while (currentIndex < endHint) {
    const item = items[currentIndex]
    if (item[0] >= interval[1]) {
      break
    }
    result.push(item[2])
    if (item[1] >= interval[1]) {
      break
    }
    currentIndex++
  }
  return [result, currentIndex]
}

export function getInstructionsDetails(
  instructions: Instruction[],
  details: Path['details'],
) {
  const result = {} as Record<RoutingDetailsCategories, any[]>

  Object.entries(details).forEach(([detailKey, detail]) => {
    let lastDetailsIndex = 0

    result[detailKey] = instructions.map((instruction) => {
      const [instructionDetails, lastIndex] = getItemsInInterval(
        detail,
        instruction.interval,
        lastDetailsIndex,
        detail.length,
      )
      lastDetailsIndex = lastIndex
      return instructionDetails
    })
  })

  return result
}
