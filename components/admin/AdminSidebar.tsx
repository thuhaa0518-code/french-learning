'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBook() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function IconFlashcard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <defs>
        <mask id="flashcard-mask">
          <rect width="24" height="24" fill="white" />
          <rect x="4" y="4" width="12" height="16" rx="2" fill="black" />
        </mask>
      </defs>
      <rect x="8" y="5" width="12" height="15" rx="2" fill="currentColor" transform="rotate(10 14 12)" mask="url(#flashcard-mask)" />
      <rect x="4" y="4" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth={2.2} />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2.5" y="15" width="4" height="7" rx="1" />
      <rect x="8.5" y="11" width="4" height="11" rx="1" />
      <rect x="14.5" y="13" width="4" height="9" rx="1" />
      <rect x="20.5" y="8" width="4" height="14" rx="1" />
      
      <path d="M4.5 11 L10.5 6 L16.5 10 L22.5 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4.5" cy="11" r="2" />
      <circle cx="10.5" cy="6" r="2" />
      <circle cx="16.5" cy="10" r="2" />
      <circle cx="22.5" cy="4" r="2" />
    </svg>
  )
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const CONTENT_NAV = [
  { href: '/admin/bai-hoc', label: 'Bài học', icon: <IconBook /> },
  { href: '/admin/flashcard', label: 'Flashcard', icon: <IconFlashcard /> },
  { href: '/admin/de-thi', label: 'Đề thi', icon: <IconClipboard /> },
]

const SYSTEM_NAV = [
  { href: '/admin/nguoi-dung', label: 'Người dùng', icon: <IconUsers /> },
  { href: '/admin/thong-ke', label: 'Thống kê', icon: <IconBarChart /> },
]

// ─── Component ────────────────────────────────────────────────────────────────

import { useSidebar } from './SidebarContext'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { isExpanded } = useSidebar()

  function NavItemExpanded({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`flex items-center gap-4 px-6 py-4 text-base font-semibold whitespace-nowrap transition-colors ${
          isActive ? 'bg-[#CB30E0]/10 text-[#CB30E0]' : 'text-black hover:text-[#CB30E0] hover:bg-white/60'
        }`}
      >
        <span className={isActive ? 'text-[#CB30E0]' : 'text-black'}>{icon}</span>
        {label}
      </Link>
    )
  }

  function NavItemCollapsed({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        title={label}
        className={`flex items-center justify-center h-14 w-full transition-colors ${
          isActive ? 'bg-[#CB30E0]/10 text-[#CB30E0] font-semibold' : 'text-black hover:text-[#CB30E0] hover:bg-white/60'
        }`}
      >
        <span className={isActive ? 'text-[#CB30E0]' : 'text-black'}>{icon}</span>
      </Link>
    )
  }

  return (
    <aside 
      className={`shrink-0 border-r border-pink-100 transition-all duration-300 flex flex-col ${isExpanded ? 'w-56' : 'w-[72px] items-center'}`} 
      style={{ backgroundColor: 'rgba(255, 170, 238, 0.1882)' }}
    >
      <div className={`pt-5 pb-3 flex flex-col w-full`}>
        {isExpanded && <p className="mb-2 px-6 text-sm font-bold uppercase tracking-wider text-gray-500">Nội dung</p>}
        <nav className={`flex flex-col w-full ${isExpanded ? 'gap-0' : 'gap-0 mt-2'}`}>
          {CONTENT_NAV.map((item) => (
            isExpanded ? <NavItemExpanded key={item.href} {...item} /> : <NavItemCollapsed key={item.href} {...item} />
          ))}
        </nav>
        <div className={`my-4 mx-auto border-t border-pink-200 ${isExpanded ? 'w-[calc(100%-3rem)]' : 'w-8'}`} />
        {isExpanded && <p className="mb-2 px-6 text-sm font-bold uppercase tracking-wider text-gray-500">Hệ thống</p>}
        <nav className={`flex flex-col w-full ${isExpanded ? 'gap-0' : 'gap-0'}`}>
          {SYSTEM_NAV.map((item) => (
            isExpanded ? <NavItemExpanded key={item.href} {...item} /> : <NavItemCollapsed key={item.href} {...item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
