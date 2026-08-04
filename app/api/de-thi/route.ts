import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { CreateExamSchema } from '@/lib/validations/exam'

// GET /api/de-thi — Public, danh sách đề thi đã xuất bản
export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where: { isPublish: true },
      select: {
        id: true,
        tieuDe: true,
        moTa: true,
        level: true,
        thoiGianLam: true,
        isPublish: true,
        _count: { select: { questions: true } },
      },
      orderBy: { tieuDe: 'asc' },
    })

    return ok({ exams, total: exams.length })
  } catch (error) {
    console.error('[GET /api/de-thi]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy danh sách đề thi', 500)
  }
}

// POST /api/de-thi — Admin only, tạo đề thi mới
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
    const parsed = CreateExamSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const exam = await prisma.exam.create({ data: parsed.data })
    return ok({ exam }, 201)
  } catch (error) {
    console.error('[POST /api/de-thi]', error)
    return err('INTERNAL_ERROR', 'Không thể tạo đề thi', 500)
  }
}
