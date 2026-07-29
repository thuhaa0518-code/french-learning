import type { LessonLevel } from '@/types'

const LEVEL_COLORS: Record<LessonLevel, string> = {
  A1: 'bg-green-100 text-green-800 border-green-200',
  A2: 'bg-blue-100 text-blue-800 border-blue-200',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  B2: 'bg-red-100 text-red-800 border-red-200',
}

interface LevelBadgeProps {
  level: LessonLevel | string
  className?: string
}

export default function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  const colorClass = LEVEL_COLORS[level as LessonLevel] ?? 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass} ${className}`}
    >
      {level}
    </span>
  )
}
