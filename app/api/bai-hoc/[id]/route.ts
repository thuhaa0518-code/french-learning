import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { UpdateLessonSchema } from '@/lib/validations/lesson'

type Params = { params: Promise<{ id: string }> }

// PUT /api/bai-hoc/[id] — Admin only, cập nhật bài học
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
    const parsed = UpdateLessonSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { sections, ...lessonData } = parsed.data

    // Kiểm tra lesson tồn tại
    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Bài học không tồn tại', 404)
    }

    const lesson = await prisma.$transaction(async (tx) => {
      // Nếu có sections mới, xóa sections cũ và tạo lại
      if (sections) {
        await tx.lessonSection.deleteMany({ where: { lessonId: id } })
      }

      return tx.lesson.update({
        where: { id },
        data: {
          ...lessonData,
          ...(sections
            ? {
                sections: {
                  create: sections.map((s) => ({
                    loai: s.loai,
                    noiDung: s.noiDung,
                    thuTu: s.thuTu,
                  })),
                },
              }
            : {}),
        },
        include: { sections: { orderBy: { thuTu: 'asc' } } },
      })
    })

    // Revalidate khi toggle publish
    if ('isPublish' in lessonData) {
      revalidatePath('/bai-hoc')
      revalidatePath(`/bai-hoc/${lesson.slug}`)
    }

    return ok({ lesson })
  } catch (error) {
    console.error('[PUT /api/bai-hoc/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể cập nhật bài học', 500)
  }
}

// DELETE /api/bai-hoc/[id] — Admin only, xóa bài học
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
    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing) {
      return err('NOT_FOUND', 'Bài học không tồn tại', 404)
    }

    await prisma.lesson.delete({ where: { id } })
    revalidatePath('/bai-hoc')

    return ok({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/bai-hoc/[id]]', error)
    return err('INTERNAL_ERROR', 'Không thể xóa bài học', 500)
  }
}
