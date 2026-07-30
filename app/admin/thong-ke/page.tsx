import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface StatCardProps {
  label: string
  value: number | string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5">
      <p className="mb-2 text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}</p>
    </div>
  )
}

export default async function ThongKePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range = '30' } = await searchParams

  const dateFilter =
    range === '7'
      ? { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      : range === '30'
      ? { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      : undefined

  const [
    totalUsers,
    flashcardStatesReviewed,
    publishedLessons,
    publishedExams,
    flashcardDecks,
    publishedVideos,
    totalAttempts,
    allAttempts,
    topLessons,
  ] = await Promise.all([
    prisma.user.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
    prisma.flashcardState.count(dateFilter ? { where: { updatedAt: dateFilter } } : undefined),
    prisma.lesson.count({ where: { isPublish: true, ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.exam.count({ where: { isPublish: true, ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.flashcardDeck.count({ where: { isPublish: true, ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.video.count({ where: { isPublish: true, ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.examAttempt.count({ where: { daNop: true, ...(dateFilter ? { thoiGianNop: dateFilter } : {}) } }),
    prisma.examAttempt.findMany({
      where: { daNop: true, diemSo: { not: null }, ...(dateFilter ? { thoiGianNop: dateFilter } : {}) },
      select: { diemSo: true },
    }),
    // Top bài học theo số tiến độ (proxy cho lượt xem)
    prisma.lesson.findMany({
      where: { isPublish: true },
      include: { _count: { select: { progresses: true } } },
      orderBy: { slug: 'asc' },
      take: 5,
    }),
  ])

  // Tính điểm trung bình
  const avgScore = allAttempts.length > 0
    ? (allAttempts.reduce((sum, a) => sum + (a.diemSo ?? 0), 0) / allAttempts.length).toFixed(1)
    : '0'

  // Sort top lessons
  const sortedTopLessons = [...topLessons].sort(
    (a, b) => b._count.progresses - a._count.progresses,
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold uppercase tracking-wide" style={{ color: '#CB30E0' }}>
          Thống Kê Hệ Thống
        </h1>
        <div className="flex gap-2">
          {[
            { label: '7 ngày', value: '7' },
            { label: '30 ngày', value: '30' },
            { label: 'Tất cả', value: 'all' },
          ].map((t) => (
            <Link
              key={t.value}
              href={`/admin/thong-ke?range=${t.value}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                range === t.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Row 1 — 4 stats */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        <StatCard label="Tổng người dùng" value={totalUsers} />
        <StatCard label="Thẻ đã ôn tập" value={flashcardStatesReviewed} />
        <StatCard label="Bài học đã xuất bản" value={publishedLessons} />
        <StatCard label="Đề thi đã xuất bản" value={publishedExams} />
      </div>

      {/* Row 2 — 3 stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Bộ Flashcard" value={flashcardDecks} />
        <StatCard label="Video giải đề" value={publishedVideos} />
        <StatCard label="Lượt làm bài thi" value={totalAttempts} />
      </div>

      {/* Row 3 — Top lessons + Exam stats */}
      <div className="mb-8 flex gap-4">
        {/* Top 5 bài học */}
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Top 5 bài học phổ biến nhất</span>
            <span className="text-sm text-gray-500">Lượt xem (30 ngày)</span>
          </div>
          <div className="flex flex-col gap-3">
            {sortedTopLessons.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
            ) : (
              sortedTopLessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'rgba(203, 48, 224, 0.1)', color: '#CB30E0' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-gray-800">{lesson.tieuDe}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        lesson.level === 'A1'
                          ? 'bg-blue-50 text-blue-600'
                          : lesson.level === 'A2'
                          ? 'bg-green-50 text-green-600'
                          : lesson.level === 'B1'
                          ? 'bg-orange-50 text-orange-600'
                          : lesson.level === 'B2'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Cấp độ {lesson.level}
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 text-sm font-medium text-gray-700">
                    {lesson._count.progresses.toLocaleString('vi-VN')} lượt xem
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thống kê kết quả thi */}
        <div className="w-56 shrink-0 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-gray-800">Thống kê kết quả thi</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tổng lượt làm bài</span>
              <span className="text-sm font-semibold text-gray-900">{totalAttempts.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Điểm trung bình</span>
              <span className="text-sm font-bold" style={{ color: '#CB30E0' }}>{avgScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 — Hoạt động mới nhất */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="mb-4 text-sm font-semibold text-gray-800">Hoạt động mới nhất</p>
        <ActivityFeed />
      </div>
    </div>
  )
}

// Component hiển thị hoạt động mới nhất (dữ liệu thực từ DB)
async function ActivityFeed() {
  const [recentUsers, recentAttempts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { id: 'desc' },
      take: 2,
      select: { tenHienThi: true, id: true },
    }),
    prisma.examAttempt.findMany({
      where: { daNop: true },
      orderBy: { thoiGianNop: 'desc' },
      take: 2,
      include: { exam: { select: { tieuDe: true } }, user: { select: { tenHienThi: true } } },
    }),
  ])

  const activities: { icon: string; color: string; text: string; time: string }[] = []

  for (const u of recentUsers) {
    activities.push({
      icon: '👤',
      color: '#EBF5FF',
      text: `${u.tenHienThi} vừa đăng ký tài khoản mới.`,
      time: 'Gần đây',
    })
  }

  for (const a of recentAttempts) {
    activities.push({
      icon: '✅',
      color: '#F0FFF4',
      text: `${a.user.tenHienThi} vừa hoàn thành đề thi ${a.exam.tieuDe}.`,
      time: a.thoiGianNop
        ? formatRelativeTime(a.thoiGianNop)
        : 'Gần đây',
    })
  }

  if (activities.length === 0) {
    return <p className="text-sm text-gray-400">Chưa có hoạt động nào.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {activities.slice(0, 3).map((act, idx) => (
        <div key={idx} className="rounded-xl p-4" style={{ backgroundColor: act.color }}>
          <p className="text-xs font-medium text-gray-700 leading-relaxed">{act.text}</p>
          <p className="mt-2 text-[11px] text-gray-400">{act.time}</p>
        </div>
      ))}
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}
