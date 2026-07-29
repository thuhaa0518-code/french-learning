import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string // vd: "/de-thi" hoặc "/bai-hoc"
  extraParams?: string // vd: "&level=A1&search=abc"
}

export default function Pagination({ currentPage, totalPages, baseUrl, extraParams = '' }: PaginationProps) {
  if (totalPages <= 1) return null

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
        className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold transition-all ${
          currentPage === 1
            ? 'bg-[#F4E9F1]/50 text-[#D946EF]/50 cursor-not-allowed pointer-events-none'
            : 'bg-[#F4E9F1] text-[#D946EF] hover:opacity-80'
        }`}
      >
        ‹
      </Link>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="flex h-8 w-8 items-center justify-center text-xs font-medium text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            className={`flex h-8 w-8 items-center justify-center rounded text-xs transition-all ${
              p === currentPage
                ? 'font-semibold text-gray-900'
                : 'font-medium text-gray-500 hover:bg-gray-100'
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
        className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold transition-all ${
          currentPage === totalPages
            ? 'bg-[#D946EF]/50 text-white cursor-not-allowed pointer-events-none'
            : 'bg-[#D946EF] text-white hover:opacity-90'
        }`}
      >
        ›
      </Link>
    </div>
  )
}
