export function calculateMatchPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number | null,
  actualAway: number | null
): number {
  if (actualHome === null || actualAway === null) {
    return 0;
  }
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 7;
  }
  const predictedDiff = Math.sign(predictedHome - predictedAway);
  const actualDiff = Math.sign(actualHome - actualAway);
  if (predictedDiff === actualDiff) {
    return 3;
  }
  return 0;
}