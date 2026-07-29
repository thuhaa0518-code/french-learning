import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// GET /api/flashcard/bo-the/[id] — Public, chi tiết deck + flashcards
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const deck = await prisma.flashcardDeck.findFirst({
      where: { id, isPublish: true },
      include: { flashcards: true },
    })

    if (!deck) {
      return err('NOT_FOUND', 'Bộ thẻ không tồn tại', 404)
    }

    return ok({ deck })
  } catch (error) {
    console.error('[GET /api/flashcard/bo-the/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy bộ thẻ', 500)
  }
}

// DELETE /api/flashcard/bo-the/[id] — Admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { id } = await params

  try {
    const existing = await prisma.flashcardDeck.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Bộ thẻ không tồn tại', 404)
    }

    await prisma.flashcardDeck.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/flashcard/bo-the/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể xóa bộ thẻ', 500)
  }
}
