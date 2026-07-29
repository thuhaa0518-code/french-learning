import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { CreateDeckSchema } from '@/lib/validations/flashcard'

// GET /api/flashcard/bo-the — Public, danh sách deck đã xuất bản
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const level = searchParams.get('level')
    const search = searchParams.get('search')

    const decks = await prisma.flashcardDeck.findMany({
      where: {
        isPublish: true,
        ...(level ? { level } : {}),
        ...(search ? { tieuDe: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        _count: { select: { flashcards: true } },
      },
      orderBy: { tieuDe: 'asc' },
    })

    return ok({ decks, total: decks.length })
  } catch (error) {
    console.error('[GET /api/flashcard/bo-the]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy danh sách bộ thẻ', 500)
  }
}

// POST /api/flashcard/bo-the — Admin only, tạo deck mới
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
    const parsed = CreateDeckSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const deck = await prisma.flashcardDeck.create({ data: parsed.data })
    return ok({ deck }, 201)
  } catch (error) {
    console.error('[POST /api/flashcard/bo-the]', error)
    return err('INTERNAL_ERROR', 'Không thể tạo bộ thẻ', 500)
  }
}
