/**
 * Compute exam score as a percentage rounded to 2 decimal places.
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Score in range [0, 100] rounded to 2 decimal places
 */
export function computeDiemSo(correct: number, total: number): number {
  if (total === 0) {
    return 0
  }

  if (correct < 0) {
    throw new Error('correct must be >= 0')
  }

  if (correct > total) {
    throw new Error('correct must be <= total')
  }

  // ROUND((correct / total) * 100, 2)
  return Math.round((correct / total) * 100 * 100) / 100
}
