import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Cache các query DB public (không liên quan đến user cụ thể)
 * Revalidate sau 60 giây, hoặc khi admin tạo/sửa/xóa nội dung
 */

// ─── LESSONS ────────────────────────────────────────────────────────────────

export const getCachedLessons = unstable_cache(
  async (params: {
    where: Record<string, unknown>
    skip: number
    take: number
    orderBy: Record<string, unknown>
  }) => {
    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      prisma.lesson.count({ where: params.where }),
    ])
    return { lessons, total }
  },
  ['public-lessons'],
  { revalidate: 60, tags: ['lessons'] }
)

// ─── FLASHCARD DECKS ─────────────────────────────────────────────────────────

export const getCachedDecks = unstable_cache(
  async (params: {
    where: Record<string, unknown>
    skip: number
    take: number
    orderBy: Record<string, unknown>
  }) => {
    const [decks, total] = await Promise.all([
      prisma.flashcardDeck.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: { _count: { select: { flashcards: true } } },
      }),
      prisma.flashcardDeck.count({ where: params.where }),
    ])
    return { decks, total }
  },
  ['public-decks'],
  { revalidate: 60, tags: ['decks'] }
)

// ─── EXAMS ───────────────────────────────────────────────────────────────────

export const getCachedExams = unstable_cache(
  async (params: {
    where: Record<string, unknown>
    skip: number
    take: number
    orderBy: Record<string, unknown>
  }) => {
    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: { _count: { select: { questions: true } } },
      }),
      prisma.exam.count({ where: params.where }),
    ])
    return { exams, total }
  },
  ['public-exams'],
  { revalidate: 60, tags: ['exams'] }
)

// ─── HOMEPAGE DATA ────────────────────────────────────────────────────────────

export const getCachedHomepageData = unstable_cache(
  async () => {
    const [allLessons, decks, exams] = await Promise.all([
      prisma.lesson.findMany({
        where: { isPublish: true },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.flashcardDeck.findMany({
        where: { isPublish: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { flashcards: true } } },
      }),
      prisma.exam.findMany({
        where: { isPublish: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { questions: true } } },
      }),
    ])
    return { allLessons, decks, exams }
  },
  ['homepage-data'],
  { revalidate: 60, tags: ['lessons', 'decks', 'exams'] }
)

// ─── USER DECK PROGRESS (không cache — user-specific) ────────────────────────

/**
 * Lấy tiến độ học flashcard của user theo từng deck.
 * Dùng raw SQL GROUP BY thay vì JOIN qua từng flashcard (nhanh hơn nhiều).
 */
export async function getUserDeckProgress(userId: string): Promise<Record<string, number>> {
  const rows = await prisma.$queryRaw<{ deck_id: string; count: bigint }[]>`
    SELECT f.deck_id, COUNT(*) as count
    FROM flashcard_states fs
    JOIN flashcards f ON f.id = fs.flashcard_id
    WHERE fs.user_id = ${userId}
    GROUP BY f.deck_id
  `
  const result: Record<string, number> = {}
  for (const row of rows) {
    result[row.deck_id] = Number(row.count)
  }
  return result
}

/**
 * Lấy điểm cao nhất của user cho mỗi exam trong danh sách.
 */
export async function getUserBestScores(
  userId: string,
  examIds: string[]
): Promise<Record<string, number>> {
  if (examIds.length === 0) return {}

  const attempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      examId: { in: examIds },
      daNop: true,
      diemSo: { not: null },
    },
    select: { examId: true, diemSo: true },
  })

  const bestScores: Record<string, number> = {}
  for (const a of attempts) {
    if (a.diemSo !== null) {
      if (bestScores[a.examId] === undefined || a.diemSo > bestScores[a.examId]) {
        bestScores[a.examId] = Math.round(a.diemSo)
      }
    }
  }
  return bestScores
}
