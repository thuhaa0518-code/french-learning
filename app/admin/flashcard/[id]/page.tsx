import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{deck.tieuDe}</h1>
      <p className="mb-6 text-sm text-gray-500">{deck.flashcards.length} thẻ</p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">Từ pháp</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Phát âm</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Nghĩa</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Ví dụ</th>
            </tr>
          </thead>
          <tbody>
            {deck.flashcards.map((card) => (
              <tr key={card.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-primary">{card.tuPhap}</td>
                <td className="px-4 py-3 text-gray-500 italic">{card.phatAm ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{card.nghiaViet}</td>
                <td className="px-4 py-3 text-gray-500">{card.viDu ?? '—'}</td>
              </tr>
            ))}
            {deck.flashcards.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Chưa có thẻ nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
