import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes yêu cầu vai trò ADMIN
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Luôn gọi auth() để Clerk inject session context vào mọi request
  await auth()

  // Admin routes — kiểm tra vai trò ADMIN
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    const meta = sessionClaims?.publicMetadata as Record<string, unknown> | undefined
    const metaDirect = sessionClaims as Record<string, unknown> | undefined
    const vaiTro = (meta?.vai_tro ?? metaDirect?.vai_tro) as string | undefined
    if (vaiTro !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Forward pathname vào header để Navbar biết trang hiện tại
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
