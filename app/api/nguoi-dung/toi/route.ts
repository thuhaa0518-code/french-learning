import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'
import { UpdateProfileSchema } from '@/lib/validations/user'

// GET /api/nguoi-dung/toi — Student: lấy thông tin user hiện tại
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

  return ok({
    id: user.id,
    email: user.email,
    tenHienThi: user.tenHienThi,
    vaiTro: user.vaiTro,
  })
}

// PUT /api/nguoi-dung/toi — Student: cập nhật tên hiển thị
export async function PUT(req: NextRequest) {
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
    const parsed = UpdateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { tenHienThi: parsed.data.tenHienThi },
    })

    return ok({ tenHienThi: updated.tenHienThi })
  } catch (error) {
    console.error('[PUT /api/nguoi-dung/toi]', error)
    return err('INTERNAL_ERROR', 'Không thể cập nhật thông tin', 500)
  }
}
