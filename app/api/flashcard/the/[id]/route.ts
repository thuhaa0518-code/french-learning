import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { UpdateCardSchema } from '@/lib/validations/flashcard'

type Params = { params: Promise<{ id: string }> }

// PUT /api/flashcard/the/[id] — Admin only, cập nhật thẻ
export async function PUT(req: NextRequest, { params }: Params) {
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
    const body = await req.json()
    const parsed = UpdateCardSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const existing = await prisma.flashcard.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Thẻ không tồn tại', 404)
    }

    const flashcard = await prisma.flashcard.update({
      where: { id },
      data: parsed.data,
    })

    return ok({ flashcard })
  } catch (error) {
    console.error('[PUT /api/flashcard/the/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể cập nhật thẻ', 500)
  }
}

// DELETE /api/flashcard/the/[id] — Admin only, xóa thẻ
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
    const existing = await prisma.flashcard.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Thẻ không tồn tại', 404)
    }

    await prisma.flashcard.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/flashcard/the/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể xóa thẻ', 500)
  }
}
