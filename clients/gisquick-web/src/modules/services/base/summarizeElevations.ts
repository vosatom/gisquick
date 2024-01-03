export function summarizeElevations(elevations: number[]) {
  let ascend = 0
  let descend = 0

  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0) {
      ascend += diff
    } else {
      descend -= diff
    }
  }

  return { ascend, descend }
}
