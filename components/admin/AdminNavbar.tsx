'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'
import { useSidebar } from './SidebarContext'

const TOP_NAV = [
  { href: '/admin/bai-hoc', label: 'Bài học' },
  { href: '/admin/flashcard', label: 'Flashcard' },
  { href: '/admin/de-thi', label: 'Đề thi' },
]

export default function AdminNavbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { toggleSidebar } = useSidebar()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Ẩn logo Clerk và Development mode badge
  useEffect(() => {
    const interval = setInterval(() => {
      const elements = document.querySelectorAll('div, a, span')
      elements.forEach((el) => {
        if (
          el.textContent === 'Development mode' || 
          el.textContent === 'Secured by Clerk'
        ) {
          if (el.parentElement) {
            el.parentElement.style.display = 'none'
            el.parentElement.style.opacity = '0'
          }
        }
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const name = user?.fullName || user?.firstName || 'Admin'
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const imageUrl = user?.imageUrl

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm">
      {/* Logo + ADMIN badge + Hamburger Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Mở rộng/Thu nhỏ menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/admin" className="flex items-center gap-1.5">
          <Image src="/logo-icon.png" alt="FrenchGo" width={36} height={36} className="object-contain mix-blend-multiply" />
          <span className="text-[22px] font-black text-black">FrenchGo</span>
        </Link>
        <span className="rounded-md border border-primary px-2 py-0.5 text-[11px] font-bold text-primary">ADMIN</span>
      </div>

      {/* Top nav links */}
      <nav className="hidden md:flex h-full items-center gap-1">
        {TOP_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full items-center px-6 text-[17px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#CB30E0]/10 text-[#CB30E0] font-semibold'
                  : 'text-black hover:text-[#CB30E0] hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User dropdown */}
      <div className="relative flex items-center" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {initials}
            </span>
          )}
          <span className="hidden sm:block text-sm font-semibold text-gray-800">{name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg z-50 overflow-hidden">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={name} className="h-9 w-9 rounded-full object-cover shrink-0" />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                <p className="truncate text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            {/* Chỉnh sửa thông tin */}
            <button
              onClick={() => { setOpen(false); openUserProfile() }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Tài khoản & Bảo mật
            </button>
            {/* Đăng xuất */}
            <button
              onClick={() => { setOpen(false); signOut({ redirectUrl: '/sign-in' }) }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
