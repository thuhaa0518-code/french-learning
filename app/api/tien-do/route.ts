import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'

const TienDoSchema = z.object({
  lesson_id: z.string().min(1, 'lesson_id không được để trống'),
  phan_tram: z.number().int().min(0, 'phan_tram phải >= 0').max(100, 'phan_tram phải <= 100'),
})

// POST /api/tien-do — Student: Upsert tiến độ bài học
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
    const parsed = TienDoSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { lesson_id, phan_tram } = parsed.data

    // Kiểm tra lesson tồn tại
    const lesson = await prisma.lesson.findUnique({ where: { id: lesson_id } })
    if (!lesson) {
      return err('NOT_FOUND', 'Bài học không tồn tại', 404)
    }

    // Xác định da_hoan_thanh
    const daHoanThanh = phan_tram >= 80

    // Upsert lesson_progresses trong transaction
    const progress = await prisma.$transaction(async (tx) => {
      const existing = await tx.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId: lesson_id } },
      })

      // Không downgrade da_hoan_thanh nếu đã hoàn thành
      const shouldComplete = daHoanThanh || (existing?.daHoanThanh ?? false)

      return tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId: lesson_id } },
        update: {
          phanTram: phan_tram,
          daHoanThanh: shouldComplete,
        },
        create: {
          userId: user.id,
          lessonId: lesson_id,
          phanTram: phan_tram,
          daHoanThanh: shouldComplete,
        },
      })
    })

    return ok({ phan_tram: progress.phanTram, da_hoan_thanh: progress.daHoanThanh })
  } catch (error) {
    console.error('[POST /api/tien-do]', error)
    return err('INTERNAL_ERROR', 'Không thể cập nhật tiến độ', 500)
  }
}

// GET /api/tien-do — Student: Lấy tất cả tiến độ của user
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
    const progresses = await prisma.lessonProgress.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          select: { id: true, slug: true, tieuDe: true, level: true, chuDe: true },
        },
      },
    })

    return ok({ progresses })
  } catch (error) {
    console.error('[GET /api/tien-do]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy tiến độ', 500)
  }
}
