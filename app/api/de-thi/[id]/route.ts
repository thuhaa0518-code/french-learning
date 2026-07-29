import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// GET /api/de-thi/[id] — Public, chi tiết đề thi (ẩn la_dap_an_dung)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const exam = await prisma.exam.findFirst({
      where: { id, isPublish: true },
      include: {
        questions: {
          orderBy: { thuTu: 'asc' },
          include: {
            answers: {
              // QUAN TRỌNG: KHÔNG select laDapAnDung khi đang làm bài
              select: { id: true, noiDung: true },
            },
          },
        },
      },
    })

    if (!exam) {
      return err('NOT_FOUND', 'Đề thi không tồn tại', 404)
    }

    return ok({ exam })
  } catch (error) {
    console.error('[GET /api/de-thi/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy đề thi', 500)
  }
}

// DELETE /api/de-thi/[id] — Admin only
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
    const existing = await prisma.exam.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Đề thi không tồn tại', 404)
    }

    await prisma.exam.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/de-thi/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể xóa đề thi', 500)
  }
}
