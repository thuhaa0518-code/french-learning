import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'
import { isDueForReview } from '@/lib/sm2'

// GET /api/flashcard/on-tap — Student: lấy thẻ cần ôn hôm nay
export async function GET() {
  let user
  try {
    user = await requireAuth()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  try {
    const now = new Date()

    // Lấy tất cả flashcard states của user với flashcard data
    const states = await prisma.flashcardState.findMany({
      where: { userId: user.id },
      include: { flashcard: true },
    })

    // Filter: chỉ lấy thẻ cần ôn hôm nay
    const dueCards = states
      .filter((state) => isDueForReview(state.updatedAt, state.soNgayNhacLai, now))
      .sort((a, b) => {
        // Sort theo ngày ôn tập sớm nhất
        const aNext = new Date(a.updatedAt)
        aNext.setDate(aNext.getDate() + a.soNgayNhacLai)
        const bNext = new Date(b.updatedAt)
        bNext.setDate(bNext.getDate() + b.soNgayNhacLai)
        return aNext.getTime() - bNext.getTime()
      })

    const cards = dueCards.map((state) => ({
      stateId: state.id,
      soNgayNhacLai: state.soNgayNhacLai,
      danhGiaCuoi: state.danhGiaCuoi,
      flashcard: state.flashcard,
    }))

    return ok({ cards, total: cards.length })
  } catch (error) {
    console.error('[GET /api/flashcard/on-tap]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy danh sách thẻ ôn tập', 500)
  }
}
