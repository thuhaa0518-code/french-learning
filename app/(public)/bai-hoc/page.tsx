import Link from 'next/link'
import { Suspense } from 'react'
import LessonCard from '@/components/lesson/LessonCard'
import LessonFilter from '@/components/lesson/LessonFilter'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'
import SearchInput from '@/components/shared/SearchInput'
import { getCachedLessons } from '@/lib/cached-queries'

// Cache kết quả 60 giây — đủ fresh cho nội dung học tập
export const revalidate = 60

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
  sort?: string
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

  const { lessons, total } = await getCachedLessons({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: sort as any },
  })


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
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 py-10">
        {/* Title & Saved Link */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-primary">Bài Học</h1>
        </div>

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
        <div className="mb-5">
          <SearchInput
            placeholder="Tìm kiếm bài học"
            containerClassName="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
            inputClassName="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {start}-{end} / {total} bài học
          </p>
          <Link
            href={`/bai-hoc?${page > 1 ? `page=${page}&` : ''}${level ? `level=${level}&` : ''}${chu_de ? `chu_de=${chu_de}&` : ''}${search ? `search=${search}&` : ''}sort=${sort === 'desc' ? 'asc' : 'desc'}`}
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
          <div key={page} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-page-fade">
            {lessons.map((lesson: import('@prisma/client').Lesson) => (
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
