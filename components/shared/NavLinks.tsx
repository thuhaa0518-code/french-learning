'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/bai-hoc', label: 'Bài học' },
  { href: '/flashcard', label: 'Flashcard' },
  { href: '/de-thi', label: 'Đề thi' },
]

export default function NavLinks() {
  const pathname = usePathname()
  const { userId } = useAuth()
  const isLoggedIn = !!userId

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="hidden h-full items-center gap-2 md:flex">
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex h-full items-center px-5 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-[#F4E9F1] text-primary font-semibold'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          {item.label}
        </Link>
      ))}
      {isLoggedIn && (
        <Link
          href="/dashboard"
          className={`flex h-full items-center px-5 text-sm font-medium transition-colors ${
            pathname.startsWith('/dashboard')
              ? 'bg-[#F4E9F1] text-primary font-semibold'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          Dashboard
        </Link>
      )}
    </nav>
  )
}

