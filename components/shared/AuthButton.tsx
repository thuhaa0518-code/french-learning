'use client'

import Link from 'next/link'
import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'

export default function AuthButton() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center gap-2 shrink-0 animate-pulse">
        <span className="h-8 w-8 rounded-full bg-gray-200" />
        <span className="h-5 w-20 rounded bg-gray-200" />
      </div>
    )
  }

  if (!userId) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="h-8 w-8 rounded-full bg-[#D9D9D9]" />
        <span className="font-bold text-black text-[15px]">Đăng nhập</span>
      </Link>
    )
  }

  const name = user?.fullName || user?.firstName || 'Tôi'
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const imageUrl = user?.imageUrl

  return (
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
        <span className="font-bold text-black text-[15px]">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg z-50 overflow-hidden">
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

          {/* Đăng xuất */}
          <button
            onClick={() => { setOpen(false); signOut({ redirectUrl: '/' }) }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
