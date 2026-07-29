import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'
import { requireAdmin } from '@/lib/auth'
import { UpdateRoleSchema } from '@/lib/validations/user'

type Params = { params: Promise<{ id: string }> }

// PUT /api/admin/nguoi-dung/[id]/vai-tro — Admin only
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
    const parsed = UpdateRoleSchema.safeParse(body)

    if (!parsed.success) {
      return err('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ', 422)
    }

    const { vaiTro } = parsed.data

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return err('NOT_FOUND', 'Người dùng không tồn tại', 404)
    }

    // Update DB
    const updated = await prisma.user.update({
      where: { id },
      data: { vaiTro },
    })

    // Sync với Clerk publicMetadata
    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      await client.users.updateUser(user.clerkId, {
        publicMetadata: { vai_tro: vaiTro },
      })
    } catch (clerkErr) {
      console.error('[Clerk sync error]', clerkErr)
      // Không rollback DB nếu Clerk lỗi — log và tiếp tục
    }

    return ok({ user: { id: updated.id, vaiTro: updated.vaiTro } })
  } catch (error) {
    console.error('[PUT /api/admin/nguoi-dung/[id]/vai-tro]', error)
    return err('INTERNAL_ERROR', 'Không thể cập nhật vai trò', 500)
  }
}
