import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/**
 * Lấy user hiện tại từ DB dựa trên Clerk session.
 * Trả về null nếu chưa đăng nhập hoặc user không tồn tại trong DB.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()
  if (!userId) return null

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  // Nếu user chưa có trong DB (do dev local không chạy webhook), tự động đồng bộ từ Clerk
  if (!user) {
    try {
      const { currentUser } = await import('@clerk/nextjs/server')
      const clerkUser = await currentUser()
      
      // Lấy email và tên từ Clerk nếu có, fallback về giá trị tối thiểu nếu không
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@clerk.local`
      const tenHienThi = (clerkUser
        ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
        : '') || email || 'Học viên'

      // Kiểm tra xem email đã tồn tại trong DB chưa
      const existingByEmail = await prisma.user.findUnique({ where: { email } })
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
    } catch (e) {
      console.error('[getCurrentUser] Auto sync user failed:', e)
      // Thử tìm lại user sau khi có thể đã được tạo bởi concurrent request
      user = await prisma.user.findUnique({ where: { clerkId: userId } })
    }
  }

  return user
}

/**
 * Yêu cầu user đã đăng nhập.
 * Ném lỗi 401 nếu chưa đăng nhập hoặc không tìm thấy trong DB.
 */
export async function requireAuth(): Promise<User> {
  const { userId } = await auth()
  if (!userId) {
    throw Object.assign(
      new Error('Phiên đăng nhập không tồn tại hoặc đã hết hạn (No userId from Clerk). Vui lòng tải lại trang hoặc đăng nhập lại.'),
      { statusCode: 401, code: 'UNAUTHORIZED' }
    )
  }

  const user = await getCurrentUser()
  if (!user) {
    throw Object.assign(
      new Error(`Không thể đồng bộ dữ liệu tài khoản vào hệ thống (Clerk ID: ${userId}). Vui lòng thử lại hoặc đăng nhập lại.`),
      { statusCode: 401, code: 'UNAUTHORIZED' }
    )
  }

  return user
}

/**
 * Yêu cầu user có vai trò ADMIN.
 * Ném lỗi 401 nếu chưa đăng nhập, 403 nếu không phải ADMIN.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()

  if (user.vaiTro !== 'ADMIN') {
    throw Object.assign(new Error('FORBIDDEN'), { statusCode: 403, code: 'FORBIDDEN' })
  }

  return user
}
