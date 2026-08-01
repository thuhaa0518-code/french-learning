import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import FlashcardTable from '@/components/admin/FlashcardTable'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminFlashcardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; chuDe?: string; tab?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const q = params.q?.trim() ?? ''
  const levelFilter = params.level ?? ''
  const tab = params.tab ?? 'all'

  const where = {
    ...(q ? { tieuDe: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(levelFilter ? { level: levelFilter } : {}),
    ...(tab === 'published' ? { isPublish: true } : {}),
    ...(tab === 'draft' ? { isPublish: false } : {}),
  }

  const [decks, total, totalAll, totalPublished, totalDraft, totalCards] = await Promise.all([
    prisma.flashcardDeck.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { tieuDe: 'asc' },
      include: { _count: { select: { flashcards: true } } },
    }),
    prisma.flashcardDeck.count({ where }),
    prisma.flashcardDeck.count(),
    prisma.flashcardDeck.count({ where: { isPublish: true } }),
    prisma.flashcardDeck.count({ where: { isPublish: false } }),
    prisma.flashcard.count(),
  ])

  const levels = ['A1', 'A2', 'B1', 'B2']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[23px] font-extrabold uppercase tracking-wide" style={{ color: '#CB30E0' }}>
          Quản Lý Flashcard
        </h1>
        <Link
          href="/admin/flashcard/tao-moi"
          className="inline-flex items-center justify-center gap-1.5 px-8 py-2.5 text-[15px] font-extrabold text-white rounded-xl transition-opacity hover:opacity-90 leading-none"
          style={{ backgroundColor: '#CB30E0' }}
        >
          + TẠO MỚI
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-4 w-full">
        {[
          { label: 'Tổng deck', value: totalAll },
          { label: 'Đã đăng', value: totalPublished, color: '#22c55e' },
          { label: 'Bản nháp', value: totalDraft },
          { label: 'Tổng thẻ', value: totalCards, color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center rounded-[20px] border border-gray-200 bg-white px-6 py-4 min-w-[150px] flex-1">
            <span className="text-2xl font-extrabold" style={{ color: s.color ?? '#111827' }}>{typeof s.value === 'number' ? s.value.toLocaleString('vi-VN') : s.value}</span>
            <span className="mt-1 text-sm font-bold text-gray-500 text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <FlashcardTable
        decks={decks}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        levels={levels}
      />
    </div>
  )
}
