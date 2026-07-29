'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const LEVELS = ['A1', 'A2', 'B1', 'B2']
const TOPICS = [
  { value: 'VOCABULARY', label: 'Từ vựng' },
  { value: 'GRAMMAR', label: 'Ngữ pháp' },
  { value: 'LISTENING', label: 'Luyện nghe' },
  { value: 'READING', label: 'Luyện đọc' },
]

export default function LessonFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentLevel = searchParams.get('level') ?? ''
  const currentTopic = searchParams.get('chu_de') ?? ''
  const currentSearch = searchParams.get('search') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/bai-hoc?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        type="search"
        placeholder="Tìm bài học..."
        defaultValue={currentSearch}
        onChange={(e) => {
          const timer = setTimeout(() => updateFilter('search', e.target.value), 400)
          return () => clearTimeout(timer)
        }}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />

      {/* Level filter */}
      <div className="flex gap-1.5">
        <button
          onClick={() => updateFilter('level', '')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${!currentLevel ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary'}`}
        >
          Tất cả
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => updateFilter('level', currentLevel === l ? '' : l)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentLevel === l ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Topic filter */}
      <select
        value={currentTopic}
        onChange={(e) => updateFilter('chu_de', e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">Chủ đề</option>
        {TOPICS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  )
}
