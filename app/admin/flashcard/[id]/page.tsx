import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import FlashcardDeckForm from '@/components/admin/FlashcardDeckForm'

export const dynamic = 'force-dynamic'

export default async function AdminFlashcardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id },
    include: { flashcards: { orderBy: { tuPhap: 'asc' } } },
  })

  if (!deck) notFound()

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[23px] font-extrabold tracking-wide text-primary">
          <Link href="/admin/flashcard" className="uppercase hover:underline">QUẢN LÝ FLASHCARD</Link>
          <span className="text-primary">»</span>
          <span>Chỉnh sửa</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/flashcard/${id}`} target="_blank" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Preview</Link>
          <button form="flashcard-form" name="action" value="draft" type="submit" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Lưu bản nháp</button>
          <button form="flashcard-form" name="action" value="publish" type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#CB30E0' }}>Đăng bài</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <FlashcardDeckForm
          deckId={id}
          defaultValues={{
            tieuDe: deck.tieuDe,
            moTa: deck.moTa ?? '',
            level: deck.level as 'A1' | 'A2' | 'B1' | 'B2',
            isPublish: deck.isPublish,
            cards: deck.flashcards.map((c) => ({
              tuPhap: c.tuPhap,
              phatAm: c.phatAm ?? '',
              nghiaViet: c.nghiaViet,
              viDu: c.viDu ?? '',
            })),
          }}
        />
      </div>
    </div>
  )
}
