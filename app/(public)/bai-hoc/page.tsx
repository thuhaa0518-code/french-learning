import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import LessonCard from '@/components/lesson/LessonCard'
import LessonFilter from '@/components/lesson/LessonFilter'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'

export const dynamic = 'force-dynamic'

const LEVELS = ['A1', 'A2', 'B1', 'B2']
const CHU_DE_LABELS: Record<string, string> = {
  VOCABULARY: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
  LISTENING: 'Luyện nghe',
  READING: 'Luyện đọc',
}

interface SearchParams {
  level?: string
  chu_de?: string
  search?: string
  page?: string
}

export default async function BaiHocPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { level, chu_de, search, page: pageStr, sort = 'desc' } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const limit = 9

  const where = {
    isPublish: true,
    ...(level ? { level } : {}),
    ...(chu_de ? { chuDe: chu_de } : {}),
    ...(search ? { tieuDe: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [lessons, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: sort as any },
    }),
    prisma.lesson.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const extraParams = [
    level ? `&level=${level}` : '',
    chu_de ? `&chu_de=${chu_de}` : '',
    search ? `&search=${search}` : '',
    `&sort=${sort}`,
  ].join('')

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Title */}
        <h1 className="mb-5 text-2xl font-extrabold text-primary">Bài Học</h1>

        {/* Level filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/bai-hoc"
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${!level ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary bg-white'}`}
          >
            Tất cả
          </Link>
          {LEVELS.map((l) => (
            <Link
              key={l}
              href={`/bai-hoc?level=${l}${chu_de ? `&chu_de=${chu_de}` : ''}${search ? `&search=${search}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${level === l ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary bg-white'}`}
            >
              {l}
            </Link>
          ))}
          {Object.entries(CHU_DE_LABELS).map(([val, label]) => (
            <Link
              key={val}
              href={`/bai-hoc?chu_de=${val}${level ? `&level=${level}` : ''}${search ? `&search=${search}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${chu_de === val ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary bg-white'}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" className="mb-5">
          {level && <input type="hidden" name="level" value={level} />}
          {chu_de && <input type="hidden" name="chu_de" value={chu_de} />}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              name="search"
              defaultValue={search}
              placeholder="Tìm kiếm bài học"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {start}-{end} / {total} bài học
          </p>
          <Link
            href={`/bai-hoc?${level ? `level=${level}&` : ''}${chu_de ? `chu_de=${chu_de}&` : ''}${search ? `search=${search}&` : ''}sort=${sort === 'desc' ? 'asc' : 'desc'}`}
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
        {lessons.length === 0 ? (
          <EmptyState
            title="Chưa có bài học nào"
            description="Thử thay đổi bộ lọc hoặc quay lại sau."
            icon="📚"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson: any) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/bai-hoc"
          extraParams={extraParams}
        />
      </div>


    </div>
  )
}
