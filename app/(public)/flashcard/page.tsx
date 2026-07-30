import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/shared/Pagination'

export const revalidate = 300

export default async function FlashcardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const limit = 9

  const where = {
    isPublish: true,
    ...(search ? { tieuDe: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [decks, total] = await Promise.all([
    prisma.flashcardDeck.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tieuDe: 'desc' },
      include: { _count: { select: { flashcards: true } } },
    }),
    prisma.flashcardDeck.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-extrabold tracking-widest text-primary mb-1">FLASHCARD</h1>
        <p className="text-sm text-gray-500 mb-6">{total} Flashcards</p>

        {/* Search */}
        <form method="GET" className="mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              name="search"
              defaultValue={search}
              placeholder="Tìm kiếm flashcard"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </form>

        {/* Meta */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {start}-{end} / {total} flashcard
          </p>
          <button className="flex items-center gap-1.5 text-sm font-bold text-[#C930E0]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M8 9V21" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
              <path d="M8 3L3.5 9h9z" fill="currentColor" />
              <path d="M16 3V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 21L11.5 15h9z" fill="currentColor" />
            </svg>
            Mới nhất
          </button>
        </div>

        {/* Grid */}
        {decks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Chưa có bộ thẻ nào</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {decks.map((deck, idx) => {
              // Trạng thái mock dựa trên index (sẽ dùng user progress thực sau)
              const statuses = ['Đã Hoàn Thành', 'Đang Học', 'Chưa Bắt Đầu']
              const statusColors = ['text-[#55BE24]', 'text-[#0088FF]', 'text-[#5B5B5B]']
              const dotColors = ['bg-[#55BE24]', 'bg-[#0088FF]', 'bg-[#5B5B5B]']
              const status = statuses[idx % 3]
              const statusColor = statusColors[idx % 3]
              const dotColor = dotColors[idx % 3]

              return (
              <Link key={deck.id} href={`/flashcard/${deck.id}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                <div className="relative h-44 w-full p-4 pb-2">
                  <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70"
                      alt={deck.tieuDe}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="flex flex-col p-5 pt-2">
                  <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#D946EF] line-clamp-2">
                    {deck.tieuDe}
                  </h3>
                  <div className="mb-4 flex items-center gap-5 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                      {deck._count.flashcards} Thẻ
                    </span>
                    <span className={`flex items-center gap-1 ${statusColor}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex-1 text-center font-bold text-gray-900 pr-10">
                      Bắt Đầu
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D946EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      251,232
                    </div>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/flashcard"
          extraParams={search ? `&search=${search}` : ''}
        />
      </div>
    </div>
  )
}
