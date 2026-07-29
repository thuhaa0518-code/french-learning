import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'

// GET /api/admin/nguoi-dung — Admin only, danh sách users
export async function GET(req: NextRequest) {
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
    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')
    const vaiTro = searchParams.get('vai_tro')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * limit

    const where = {
      ...(vaiTro ? { vaiTro } : {}),
      ...(search
        ? {
            OR: [
              { tenHienThi: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tenHienThi: 'asc' },
        select: { id: true, email: true, tenHienThi: true, vaiTro: true },
      }),
      prisma.user.count({ where }),
    ])

    return ok({ users, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[GET /api/admin/nguoi-dung]', error)
    return err('INTERNAL_ERROR', 'Không thể lấy danh sách người dùng', 500)
  }
}
