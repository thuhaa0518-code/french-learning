import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'
import { computeNextInterval, getNextReviewDate } from '@/lib/sm2'
import type { FlashcardRating } from '@/types'

const DanhGiaSchema = z.object({
  flashcard_id: z.string().min(1),
  danh_gia: z.enum(['De', 'Kho', 'Lam_lai']),
})

// POST /api/flashcard/danh-gia — Student: đánh giá thẻ và cập nhật SM-2
export async function POST(req: NextRequest) {
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
    const body = await req.json()
    const parsed = DanhGiaSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { flashcard_id, danh_gia } = parsed.data

    // Kiểm tra flashcard tồn tại
    const flashcard = await prisma.flashcard.findUnique({ where: { id: flashcard_id } })
    if (!flashcard) {
      return err('NOT_FOUND', 'Thẻ không tồn tại', 404)
    }

    // Lấy state hiện tại
    const existingState = await prisma.flashcardState.findUnique({
      where: { userId_flashcardId: { userId: user.id, flashcardId: flashcard_id } },
    })

    const currentInterval = existingState?.soNgayNhacLai ?? 1
    const newInterval = computeNextInterval(currentInterval, danh_gia as FlashcardRating)

    // Upsert flashcard_states
    const state = await prisma.flashcardState.upsert({
      where: { userId_flashcardId: { userId: user.id, flashcardId: flashcard_id } },
      update: {
        soNgayNhacLai: newInterval,
        danhGiaCuoi: danh_gia,
      },
      create: {
        userId: user.id,
        flashcardId: flashcard_id,
        soNgayNhacLai: newInterval,
        danhGiaCuoi: danh_gia,
      },
    })

    const nextReviewDate = getNextReviewDate(state.updatedAt, state.soNgayNhacLai)

    return ok({ nextReviewDate })
  } catch (error) {
    console.error('[POST /api/flashcard/danh-gia]', error)
    return err('INTERNAL_ERROR', 'Không thể lưu đánh giá', 500)
  }
}
