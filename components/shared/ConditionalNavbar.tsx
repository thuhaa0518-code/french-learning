'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // Ẩn Navbar học viên khi đang ở trang admin
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return <Navbar />
}
