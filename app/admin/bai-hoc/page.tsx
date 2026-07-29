import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import LessonTable from '@/components/admin/LessonTable'

export const dynamic = 'force-dynamic'

const PRIMARY = '#CB30E0'
const PAGE_SIZE = 10

interface SearchParams {
  page?: string
  q?: string
  level?: string
  chuDe?: string
  tab?: string
}

interface StatCardProps {
  label: string
  value: number
  valueColor?: string
}

function StatCard({ label, value, valueColor }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-gray-200 bg-white px-6 py-4 min-w-[150px] flex-1">
      <span
        className="text-2xl font-extrabold"
        style={{ color: valueColor ?? '#111827' }}
      >
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </span>
      <span className="mt-1 text-sm font-bold text-gray-500 text-center">{label}</span>
    </div>
  )
}

export default async function AdminBaiHocPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const q = params.q?.trim() ?? ''
  const levelFilter = params.level ?? ''
  const chuDeFilter = params.chuDe ?? ''
  const tab = params.tab ?? 'all'

  // ── Build where clause ────────────────────────────────────────────────────
  const where = {
    ...(q ? { tieuDe: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(levelFilter ? { level: levelFilter } : {}),
    ...(chuDeFilter ? { chuDe: chuDeFilter } : {}),
    ...(tab === 'published' ? { isPublish: true } : {}),
    ...(tab === 'draft' ? { isPublish: false } : {}),
  }

  // ── Fetch data (parallel) ─────────────────────────────────────────────────
  const [lessons, total, totalAll, totalPublished, totalDraft, distinctLevels, distinctChuDe] =
    await Promise.all([
      prisma.lesson.findMany({
        where,
        orderBy: { tieuDe: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { _count: { select: { sections: true } } },
      }),
      prisma.lesson.count({ where }),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { isPublish: true } }),
      prisma.lesson.count({ where: { isPublish: false } }),
      prisma.lesson.findMany({
        select: { level: true },
        distinct: ['level'],
        orderBy: { level: 'asc' },
      }),
      prisma.lesson.findMany({
        select: { chuDe: true },
        distinct: ['chuDe'],
        orderBy: { chuDe: 'asc' },
      }),
    ])

  const levels = distinctLevels.map((l) => l.level)
  const chuDeList = distinctChuDe.map((c) => c.chuDe)

  return (
    <div className="p-6 space-y-6 font-exo">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[23px] font-extrabold uppercase tracking-wide"
          style={{ color: PRIMARY }}
        >
          Quản lý bài học
        </h1>
        <Link
          href="/admin/bai-hoc/tao-moi"
          className="inline-flex items-center justify-center px-8 py-2 text-sm font-extrabold text-white rounded-xl transition-opacity hover:opacity-90 leading-none"
          style={{ backgroundColor: PRIMARY }}
        >
          + TẠO MỚI
        </Link>
      </div>

      {/* ── Stats cards ──────────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">
        <StatCard label="Tổng bài học" value={totalAll} />
        <StatCard label="Đã đăng" value={totalPublished} valueColor="#22c55e" />
        <StatCard label="Bản nháp" value={totalDraft} />
        <StatCard label="Tổng lượt xem" value="1.2k" valueColor="#3b82f6" />
      </div>

      {/* ── Table (client component) ─────────────────────────────────────────── */}
      <LessonTable
        lessons={lessons}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        levels={levels}
        chuDeList={chuDeList}
      />
    </div>
  )
}
