export function move<T>(array: T[], oldIndex: number, newIndex: number): T[] {
  const length = array.length

  if (
    length === 0 ||
    oldIndex === newIndex ||
    oldIndex < 0 ||
    oldIndex >= length
  ) {
    return array
  }

  if (newIndex >= length) {
    newIndex = length - 1
  } else if (newIndex < 0) {
    newIndex = 0
  }

  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])

  return array
}
