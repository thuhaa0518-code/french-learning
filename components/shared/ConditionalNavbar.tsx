'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()

  const searchParams = useSearchParams()

  // Ẩn Navbar học viên khi đang ở trang admin hoặc khi đang mở chế độ xem trước (preview)
  if (pathname?.startsWith('/admin') || searchParams?.get('preview') === '1') {
    return null
  }

  return <Navbar />
}
