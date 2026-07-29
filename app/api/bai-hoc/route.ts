import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { generateSlug } from '@/lib/slug'
import { CreateLessonSchema } from '@/lib/validations/lesson'

// GET /api/bai-hoc — Public, trả về bài học đã xuất bản
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const level = searchParams.get('level')
    const chuDe = searchParams.get('chu_de')
    const search = searchParams.get('search')

    const lessons = await prisma.lesson.findMany({
      where: {
        isPublish: true,
        ...(level ? { level } : {}),
        ...(chuDe ? { chuDe } : {}),
        ...(search ? { tieuDe: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { tieuDe: 'asc' },
      select: {
        id: true,
        slug: true,
        tieuDe: true,
        level: true,
        chuDe: true,
        anhBia: true,
        thoiGianDoc: true,
        isPublish: true,
      },
    })

    return ok({ lessons, total: lessons.length })
  } catch (error) {
    console.error('[GET /api/bai-hoc]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy danh sách bài học', 500)
  }
}

// POST /api/bai-hoc — Admin only, tạo bài học mới
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
    const parsed = CreateLessonSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { tieuDe, level, chuDe, anhBia, thoiGianDoc, sections, isPublish } = parsed.data

    // Tạo slug từ tiêu đề
    const baseSlug = generateSlug(tieuDe)

    // Kiểm tra slug trùng
    const existing = await prisma.lesson.findUnique({ where: { slug: baseSlug } })
    if (existing) {
      return err('CONFLICT', `Slug "${baseSlug}" đã tồn tại`, 409)
    }

    // Tạo lesson + sections trong transaction
    const lesson = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lesson.create({
        data: {
          slug: baseSlug,
          tieuDe,
          level,
          chuDe,
          anhBia,
          thoiGianDoc: thoiGianDoc ?? 5,
          isPublish: isPublish ?? false,
          sections: {
            create: sections.map((s) => ({
              loai: s.loai,
              noiDung: s.noiDung,
              thuTu: s.thuTu,
            })),
          },
        },
        include: {
          sections: { orderBy: { thuTu: 'asc' } },
        },
      })
      return newLesson
    })

    // Revalidate cache nếu lesson được publish
    if (lesson.isPublish) {
      revalidatePath('/bai-hoc')
    }

    return ok({ lesson }, 201)
  } catch (error) {
    console.error('[POST /api/bai-hoc]', error)
    return err('INTERNAL_ERROR', 'Không thể tạo bài học', 500)
  }
}
