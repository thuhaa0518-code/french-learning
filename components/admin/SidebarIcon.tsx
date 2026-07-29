'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarIconProps {
  href: string
  label: string
  children: React.ReactNode
}

export default function SidebarIcon({ href, label, children }: SidebarIconProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      title={label}
      className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
      style={
        isActive
          ? { backgroundColor: '#ffffff', color: '#CB30E0' }
          : { color: '#9333ea' }
      }
    >
      {children}
    </Link>
  )
}
