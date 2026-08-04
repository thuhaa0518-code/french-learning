import Link from 'next/link'
import LevelBadge from '@/components/shared/LevelBadge'

const TOPIC_LABELS: Record<string, string> = {
  VOCABULARY: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
  LISTENING: 'Luyện nghe',
  READING: 'Luyện đọc',
}

interface LessonCardProps {
  id: string
  slug: string
  tieuDe: string
  level: string
  chuDe: string
  anhBia?: string | null
  thoiGianDoc?: number
}

export default function LessonCard({ slug, tieuDe, level, chuDe, anhBia, thoiGianDoc }: LessonCardProps) {
  return (
    <Link href={`/bai-hoc/${slug}`} className="group block rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      {anhBia ? (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img src={anhBia} alt={tieuDe} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>
      )}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <LevelBadge level={level} />
          <span className="text-sm text-gray-500">{TOPIC_LABELS[chuDe] ?? chuDe}</span>
        </div>
        <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {tieuDe}
        </h3>
        {thoiGianDoc && (
          <p className="text-sm text-gray-400">⏱ {thoiGianDoc} phút đọc</p>
        )}
      </div>
    </Link>
  )
}
