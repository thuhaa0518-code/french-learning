import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { CreateQuestionSchema } from '@/lib/validations/exam'

type Params = { params: Promise<{ id: string }> }

// POST /api/de-thi/[id]/cau-hoi — Admin only, thêm câu hỏi + đáp án
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const e = error as Error & { code: string; statusCode: number }
      return err(e.code, e.message, e.statusCode)
    }
    return err('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { id: examId } = await params

  try {
    const body = await req.json()
    const parsed = CreateQuestionSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    // Kiểm tra exam tồn tại
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return err('NOT_FOUND', 'Đề thi không tồn tại', 404)
    }

    const { loai, noiDung, giaiThich, thuTu, dapAn } = parsed.data

    // Tạo question + answers trong transaction
    const question = await prisma.$transaction(async (tx) => {
      return tx.question.create({
        data: {
          examId,
          loai,
          noiDung,
          giaiThich,
          thuTu,
          answers: {
            create: dapAn.map((d) => ({
              noiDung: d.noiDung,
              laDapAnDung: d.laDapAnDung,
            })),
          },
        },
        include: { answers: true },
      })
    })

    return ok({ question }, 201)
  } catch (error) {
    console.error('[POST /api/de-thi/[id]/cau-hoi]', error)
    return err('INTERNAL_ERROR', 'Không thể thêm câu hỏi', 500)
  }
}
