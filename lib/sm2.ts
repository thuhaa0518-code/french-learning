import type { FlashcardRating } from '@/types'

/**
 * Tính khoảng cách ôn tập tiếp theo (số ngày) theo thuật toán SM-2.
 *
 * - 'Lam_lai' → 1 ngày (reset)
 * - 'Kho'     → FLOOR(current × 1.5), tối thiểu 1
 * - 'De'      → FLOOR(current × 2.5), tối thiểu 1
 */
export function computeNextInterval(current: number, rating: FlashcardRating): number {
  switch (rating) {
    case 'Lam_lai':
      return 1
    case 'Kho':
      return Math.max(1, Math.floor(current * 1.5))
    case 'De':
      return Math.max(1, Math.floor(current * 2.5))
  }
}

/**
 * Tính ngày ôn tập tiếp theo dựa trên thời điểm cập nhật và khoảng cách (số ngày).
 */
export function getNextReviewDate(updatedAt: Date, interval: number): Date {
  const next = new Date(updatedAt)
  next.setDate(next.getDate() + interval)
  return next
}

/**
 * Kiểm tra thẻ có cần ôn tập hôm nay hay chưa.
 * Trả về true nếu ngày ôn tiếp theo <= now.
 */
export function isDueForReview(updatedAt: Date, interval: number, now: Date): boolean {
  return getNextReviewDate(updatedAt, interval) <= now
}
