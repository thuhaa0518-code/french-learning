import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Pagination from '@/components/shared/Pagination'
import SearchInput from '@/components/shared/SearchInput'
import { getCachedDecks, getUserDeckProgress } from '@/lib/cached-queries'

// Cache listing 60 giây; user progress được tải riêng và không được cache
export const revalidate = 60

export default async function FlashcardPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    page?: string
    sort?: string
  }>
}) {
  const { search, page: pageStr, sort = 'desc' } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const limit = 9

  const where = {
    isPublish: true,
    ...(search ? { tieuDe: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  // Chạy song song: cached decks + auth
  const [{ decks, total }, { userId }] = await Promise.all([
    getCachedDecks({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: sort as any },
    }),
    auth(),
  ])

  // Lấy tiến độ user (dùng raw SQL GROUP BY — nhanh hơn nhiều)
  let userDeckProgress: Record<string, number> = {}
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })
    if (user) {
      userDeckProgress = await getUserDeckProgress(user.id)
    }
  }


  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 py-10">
        {/* Header */}
        <h1 className="text-2xl font-extrabold tracking-widest text-primary mb-1">FLASHCARD</h1>
        <p className="text-sm text-gray-500 mb-6">{total} Flashcards</p>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="Tìm kiếm flashcard"
            containerClassName="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
            inputClassName="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Meta */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {start}-{end} / {total} flashcard
          </p>
          <Link
            href={`/flashcard?${page > 1 ? `page=${page}&` : ''}${search ? `search=${search}&` : ''}sort=${sort === 'desc' ? 'asc' : 'desc'}`}
            className="flex items-center gap-1.5 text-sm font-bold text-[#C930E0] hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: sort === 'asc' ? 'rotate(180deg)' : 'none' }}>
              <path d="M8 9V21" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
              <path d="M8 3L3.5 9h9z" fill="currentColor" />
              <path d="M16 3V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 21L11.5 15h9z" fill="currentColor" />
            </svg>
            {sort === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
          </Link>
        </div>

        {/* Grid */}
        {decks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Chưa có bộ thẻ nào</div>
        ) : (
          <div key={page} className="grid grid-cols-3 gap-5 animate-page-fade">
            {decks.map((deck: import('@prisma/client').FlashcardDeck & { _count: { flashcards: number } }, idx: number) => {
              // Trạng thái dựa trên tiến độ học thực tế
              const totalCards = deck._count.flashcards
              const studiedCards = userDeckProgress[deck.id] || 0
              
              let status = 'Chưa Bắt Đầu'
              let statusColor = 'text-[#5B5B5B]'
              let dotColor = 'bg-[#5B5B5B]'

              if (studiedCards > 0) {
                if (studiedCards >= totalCards && totalCards > 0) {
                  status = 'Đã Hoàn Thành'
                  statusColor = 'text-[#55BE24]'
                  dotColor = 'bg-[#55BE24]'
                } else {
                  status = 'Đang Học'
                  statusColor = 'text-[#0088FF]'
                  dotColor = 'bg-[#0088FF]'
                }
              }

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
                  <div className="mb-4 flex items-center gap-5 text-sm font-medium text-gray-500">
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
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D946EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {deck.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 500 + 10}
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
          extraParams={`${search ? `&search=${search}` : ''}&sort=${sort}`}
        />
      </div>
    </div>
  )
}
