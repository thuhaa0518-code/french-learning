import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { CreateCardSchema } from '@/lib/validations/flashcard'

// POST /api/flashcard/the — Admin only, thêm thẻ vào deck
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  try {
    const body = await req.json()
    const parsed = CreateCardSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { deckId, ...cardData } = parsed.data

    // Kiểm tra deck tồn tại
    const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } })
    if (!deck) {
      return err('NOT_FOUND', 'Bộ thẻ không tồn tại', 404)
    }

    const flashcard = await prisma.flashcard.create({
      data: { deckId, ...cardData },
    })

    return ok({ flashcard }, 201)
  } catch (error) {
    console.error('[POST /api/flashcard/the]', error)
    return err('INTERNAL_ERROR', 'Không thể thêm thẻ', 500)
  }
}
