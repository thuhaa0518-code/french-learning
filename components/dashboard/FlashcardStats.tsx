import Link from 'next/link'

interface FlashcardStatsProps {
  deckCount: number
  dueToday: number
}

export default function FlashcardStats({ deckCount, dueToday }: FlashcardStatsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Flashcard</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-purple-50 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{deckCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">Bộ thẻ đang học</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{dueToday}</p>
          <p className="text-xs text-gray-600 mt-0.5">Cần ôn hôm nay</p>
        </div>
      </div>

      {dueToday > 0 && (
        <Link
          href="/flashcard"
          className="block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ôn tập ngay →
        </Link>
      )}
    </div>
  )
}
