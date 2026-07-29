'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on authentication pages and admin
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname?.startsWith('/admin')) {
    return null
  }
  
  return <Footer />
}
