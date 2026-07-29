import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// GET /api/auth/redirect — Redirect sau đăng nhập dựa theo vai trò
export async function GET() {
  const { sessionClaims } = await auth()
  const meta = sessionClaims?.publicMetadata as Record<string, unknown> | undefined
  const vaiTro = meta?.vai_tro as string | undefined

  if (vaiTro === 'ADMIN') {
    redirect('/admin/thong-ke')
  } else {
    redirect('/dashboard')
  }
}
