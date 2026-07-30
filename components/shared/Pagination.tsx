import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string // vd: "/de-thi" hoặc "/bai-hoc"
  extraParams?: string // vd: "&level=A1&search=abc"
}

export default function Pagination({ currentPage, totalPages, baseUrl, extraParams = '' }: PaginationProps) {
  // Always render to allow user to see the design even if there is only 1 page
  // if (totalPages <= 1) return null

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

  const makeHref = (p: number) => `${baseUrl}?page=${p}${extraParams}`

  return (
    <div className="mt-8 flex items-center justify-end gap-1.5">
      {/* Prev */}
      <Link
        href={makeHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-all ${
          currentPage === 1
            ? 'bg-[#FAEAFF]/50 text-[#C930E0]/50 cursor-not-allowed pointer-events-none'
            : 'bg-[#FAEAFF] text-[#C930E0] hover:bg-[#f3d9f9]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </Link>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="flex h-7 w-5 items-center justify-center text-xs font-semibold text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p as number)}
            className={`flex h-7 w-6 items-center justify-center text-xs transition-all ${
              p === currentPage
                ? 'font-bold text-gray-900'
                : 'font-semibold text-gray-500 hover:text-gray-900'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-all ${
          currentPage === totalPages
            ? 'bg-[#C930E0]/50 text-white cursor-not-allowed pointer-events-none'
            : 'bg-[#C930E0] text-white hover:opacity-90'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </Link>
    </div>
  )
}
