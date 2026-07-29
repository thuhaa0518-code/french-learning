import Link from 'next/link'
import LevelBadge from '@/components/shared/LevelBadge'

interface ExamCardProps {
  id: string
  tieuDe: string
  moTa?: string | null
  level: string
  thoiGianLam: number
  _count?: { questions: number }
}

export default function ExamCard({ id, tieuDe, moTa, level, thoiGianLam, _count }: ExamCardProps) {
  return (
    <Link
      href={`/de-thi/${id}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-3xl">📝</span>
        <LevelBadge level={level} />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
        {tieuDe}
      </h3>
      {moTa && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{moTa}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>⏱ {thoiGianLam} phút</span>
        {_count && <span>❓ {_count.questions} câu</span>}
      </div>
    </Link>
  )
}
