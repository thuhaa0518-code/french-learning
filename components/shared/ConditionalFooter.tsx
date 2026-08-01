'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Hide footer on authentication pages, admin, and preview mode
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname?.startsWith('/admin') || searchParams?.get('preview') === '1') {
    return null
  }
  
  return <Footer />
}
