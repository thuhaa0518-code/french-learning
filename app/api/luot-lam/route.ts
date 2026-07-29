import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'

const CreateAttemptSchema = z.object({
  exam_id: z.string().min(1, 'exam_id không được để trống'),
})

// POST /api/luot-lam — Student: bắt đầu làm bài
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
    const parsed = CreateAttemptSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { exam_id } = parsed.data

    // Kiểm tra exam tồn tại và đã publish
    const exam = await prisma.exam.findFirst({
      where: { id: exam_id, isPublish: true },
    })

    if (!exam) {
      return err('NOT_FOUND', 'Đề thi không tồn tại hoặc chưa được xuất bản', 404)
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam_id,
        daNop: false,
      },
    })

    return ok({ attempt_id: attempt.id }, 201)
  } catch (error) {
    console.error('[POST /api/luot-lam]', error)
    const msg = error instanceof Error ? error.message : 'Không thể tạo lượt làm bài'
    return err('INTERNAL_ERROR', msg, 500)
  }
}
