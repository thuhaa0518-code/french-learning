import Link from 'next/link'
import LevelBadge from '@/components/shared/LevelBadge'

// Ảnh học tập theo chủ đề
const DECK_IMAGES = [
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=70',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=70',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=70',
  'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&q=70',
]

// Lấy ảnh theo id để ổn định (không random mỗi lần render)
function getImage(id: string) {
  const idx = id.charCodeAt(id.length - 1) % DECK_IMAGES.length
  return DECK_IMAGES[idx]
}

interface DeckCardProps {
  id: string
  tieuDe: string
  moTa?: string | null
  level?: string | null
  _count?: { flashcards: number }
}

export default function DeckCard({ id, tieuDe, moTa, level, _count }: DeckCardProps) {
  return (
    <Link
      href={`/flashcard/${id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Ảnh */}
      <div className="h-36 overflow-hidden">
        <img
          src={getImage(id)}
          alt={tieuDe}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {level && <LevelBadge level={level} />}
          {_count && <p className="text-xs text-gray-400">{_count.flashcards} thẻ</p>}
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm">
          {tieuDe}
        </h3>
        {moTa && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{moTa}</p>}
      </div>
    </Link>
  )
}
