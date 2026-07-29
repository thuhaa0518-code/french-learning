import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-response'

// POST /api/auth/sync — Tự động tạo user trong DB sau khi đăng nhập
// Gọi sau khi sign-in/sign-up thành công
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return err('UNAUTHORIZED', 'Unauthorized', 401)

    // Kiểm tra user đã tồn tại chưa
    const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (existing) return ok({ user: existing, created: false })

    // Lấy thông tin từ Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) return err('NOT_FOUND', 'Clerk user not found', 404)

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const tenHienThi = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email

    const existingByEmail = email ? await prisma.user.findUnique({ where: { email } }) : null
    let user
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { clerkId: userId, tenHienThi },
      })
    } else {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          tenHienThi,
          vaiTro: 'STUDENT',
        },
      })
    }

    return ok({ user, created: !existingByEmail })
  } catch (error) {
    console.error('[POST /api/auth/sync]', error)
    return err('INTERNAL_ERROR', 'Sync failed', 500)
  }
}
