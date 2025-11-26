// src/utils/scoring.ts
export function calculateMatchPoints(
  predictedHome: number,
  predictedAway: number,
  resultHome: number | null,
  resultAway: number | null
): number {
  // אם אין עדיין תוצאה – 0 נק'
  if (resultHome === null || resultAway === null) return 0;

  // בול פגיעה
  if (predictedHome === resultHome && predictedAway === resultAway) {
    return 7;
  }

  const predDiff = predictedHome - predictedAway;
  const realDiff = resultHome - resultAway;

  // אותו כיוון (ניצחון בית / חוץ / תיקו)
  if (
    (predDiff > 0 && realDiff > 0) ||
    (predDiff === 0 && realDiff === 0) ||
    (predDiff < 0 && realDiff < 0)
  ) {
    return 3;
  }

  return 0;
}