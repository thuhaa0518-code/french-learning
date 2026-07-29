import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Pagination from '@/components/shared/Pagination'

export const dynamic = 'force-dynamic'

const FILTER_TABS = ['Tất cả', 'A1', 'A2', 'B1', 'B2', 'DELF', 'Thực hành', 'Có video giải']

export default async function DeThiPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; search?: string; page?: string }>
}) {
  const { level, search, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const limit = 9

  const where = {
    isPublish: true,
    ...(level && level !== 'Tất cả' ? { level } : {}),
    ...(search ? { tieuDe: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  // Lấy user hiện tại (nếu đã đăng nhập) để hiển thị điểm cao nhất
  const user = await getCurrentUser()

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tieuDe: 'desc' },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.exam.count({ where }),
  ])

  // Lấy điểm cao nhất của user cho từng đề thi đang hiển thị
  const bestScores: Record<string, number> = {}
  if (user && exams.length > 0) {
    const examIds = exams.map((e) => e.id)
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        examId: { in: examIds },
        daNop: true,
        diemSo: { not: null },
      },
      select: { examId: true, diemSo: true },
    })
    for (const a of attempts) {
      if (a.diemSo !== null) {
        if (bestScores[a.examId] === undefined || a.diemSo > bestScores[a.examId]) {
          bestScores[a.examId] = Math.round(a.diemSo)
        }
      }
    }
  }

  const totalPages = Math.ceil(total / limit)
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  const activeTab = level ?? 'Tất cả'

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">

        {/* Title */}
        <h1 className="mb-5 text-2xl font-extrabold text-primary">Đề Thi</h1>

        {/* Filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab || (tab === 'Tất cả' && !level)
            const href = tab === 'Tất cả'
              ? '/de-thi'
              : `/de-thi?level=${tab}${search ? `&search=${search}` : ''}`
            return (
              <Link
                key={tab}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary bg-white'
                }`}
              >
                {tab}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form method="GET" className="mb-5">
          {level && <input type="hidden" name="level" value={level} />}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              name="search"
              defaultValue={search}
              placeholder="Tìm kiếm đề thi"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </form>

        {/* Meta */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {start}-{end} / {total} đề thi
          </p>
          <button className="flex items-center gap-1 text-sm font-medium text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>
            </svg>
            Mới nhất
          </button>
        </div>

        {/* Grid */}
        {exams.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Chưa có đề thi nào</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {exams.map((exam) => {
              const bestScore = bestScores[exam.id]
              const daDo = bestScore !== undefined
              return (
                <div key={exam.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D946EF] text-sm font-bold text-white shrink-0">
                    {exam.level}
                  </div>
                  <h3 className="mb-5 text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug">
                    {exam.tieuDe}
                  </h3>
                  <div className="mb-6 flex flex-wrap items-center gap-4 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                      {exam.thoiGianLam} Phút
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                      {exam._count.questions} Câu
                    </span>
                    {daDo ? (
                      <span className={`flex items-center gap-1.5 ${bestScore >= 60 ? 'text-green-500' : 'text-red-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${bestScore >= 60 ? 'bg-green-500' : 'bg-red-400'}`} />
                        Cao nhất: {bestScore}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        Chưa làm
                      </span>
                    )}
                  </div>
                  <Link href={`/de-thi/${exam.id}`}
                    className="mt-auto border-t border-gray-100 pt-5 text-center text-[15px] font-bold text-gray-900 transition-opacity hover:opacity-70">
                    {daDo ? 'Làm Lại' : 'Bắt Đầu'}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/de-thi"
          extraParams={`${level ? `&level=${level}` : ''}${search ? `&search=${search}` : ''}`}
        />

      </div>


    </div>
  )
}
