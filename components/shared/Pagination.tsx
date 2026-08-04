'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition, useCallback } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string // vd: "/de-thi" hoặc "/bai-hoc"
  extraParams?: string // vd: "&level=A1&search=abc"
}

export default function Pagination({ currentPage, totalPages, baseUrl, extraParams = '' }: PaginationProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const makeHref = useCallback(
    (p: number) => `${baseUrl}?page=${p}${extraParams}`,
    [baseUrl, extraParams]
  )

  const navigate = useCallback(
    (p: number) => {
      startTransition(() => {
        router.push(makeHref(p))
      })
    },
    [router, makeHref]
  )

  // Tạo danh sách trang hiển thị: 1, 2, ..., n
  const pages: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  return (
    <div className="mt-8 flex items-center justify-end gap-1.5 relative">
      {/* Loading overlay — hiện spinner khi đang chờ trang mới */}
      {isPending && (
        <div className="absolute inset-0 -inset-x-2 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 shadow-sm border border-gray-100">
            <svg
              className="h-3.5 w-3.5 animate-spin text-[#C930E0]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[11px] font-semibold text-[#C930E0]">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Prev */}
      <button
        onClick={() => !isFirst && navigate(currentPage - 1)}
        disabled={isFirst || isPending}
        aria-label="Trang trước"
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-all ${
          isFirst
            ? 'bg-[#FAEAFF]/50 text-[#C930E0]/50 cursor-not-allowed'
            : isPending
            ? 'bg-[#FAEAFF] text-[#C930E0]/50 cursor-wait'
            : 'bg-[#FAEAFF] text-[#C930E0] hover:bg-[#f3d9f9]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="flex h-7 w-5 items-center justify-center text-xs font-semibold text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => p !== currentPage && navigate(p as number)}
            disabled={p === currentPage || isPending}
            className={`flex h-7 min-w-[28px] items-center justify-center rounded-md text-xs transition-all ${
              p === currentPage
                ? 'font-bold text-gray-900 bg-[#5B5B5B]/10 cursor-default'
                : isPending
                ? 'font-semibold text-gray-400 cursor-wait'
                : 'font-semibold text-gray-500 hover:text-gray-900 cursor-pointer'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => !isLast && navigate(currentPage + 1)}
        disabled={isLast || isPending}
        aria-label="Trang sau"
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-all ${
          isLast
            ? 'bg-[#C930E0]/50 text-white cursor-not-allowed'
            : isPending
            ? 'bg-[#C930E0]/70 text-white cursor-wait'
            : 'bg-[#C930E0] text-white hover:opacity-90'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  )
}
