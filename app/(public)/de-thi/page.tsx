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
    const examIds = exams.map((e: any) => e.id)
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
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#FAEAFF] text-[#C930E0]'
                    : 'border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 bg-white'
                }`}
              >
                {tab}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form method="GET" className="mb-6 border-b border-gray-100 pb-6">
          {level && <input type="hidden" name="level" value={level} />}
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Tìm kiếm đề thi"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
        </form>

        {/* Meta */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[15px] font-medium text-gray-900">
            Hiển thị {start}-{end} / {total} đề thi
          </p>
          <button className="flex items-center gap-1.5 text-sm font-bold text-[#C930E0]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M8 9V21" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
              <path d="M8 3L3.5 9h9z" fill="currentColor" />
              <path d="M16 3V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 21L11.5 15h9z" fill="currentColor" />
            </svg>
            Mới nhất
          </button>
        </div>

        {/* Grid */}
        {exams.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Chưa có đề thi nào</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {exams.map((exam: any) => {
              const bestScore = bestScores[exam.id]
              const daDo = bestScore !== undefined
              return (
                <div key={exam.id} className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow">
                  {/* Badge positioned absolutely */}
                  <div className="absolute top-5 left-5 inline-flex items-center justify-center rounded-full bg-[#C930E0] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                    {exam.level}
                  </div>
                  <h3 className="mt-8 mb-5 text-[14px] font-bold text-gray-900 line-clamp-2 leading-snug text-center min-h-[40px]">
                    {exam.tieuDe}
                  </h3>
                  <div className="mb-6 flex items-center justify-center gap-3 text-[10px] font-medium text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#C930E0] shrink-0">
                        <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        <polyline points="12 7 12 12 15 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      {exam.thoiGianLam} Phút
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[#C930E0] shrink-0">
                        <path d="M16 3h-1.5A2.5 2.5 0 0 0 12 1a2.5 2.5 0 0 0-2.5 2.5H8A2.5 2.5 0 0 0 5.5 6v14A2.5 2.5 0 0 0 8 22.5h8a2.5 2.5 0 0 0 2.5-2.5V6A2.5 2.5 0 0 0 16 3z" />
                        <circle cx="12" cy="3.5" r="1.5" fill="white" />
                        <rect x="8.5" y="9" width="7" height="2" fill="white" rx="1" />
                        <rect x="8.5" y="13" width="7" height="2" fill="white" rx="1" />
                        <rect x="8.5" y="17" width="5" height="2" fill="white" rx="1" />
                      </svg>
                      {exam._count.questions} Câu
                    </span>
                    {daDo ? (
                      <span className={`flex items-center gap-1 ${bestScore >= 60 ? 'text-[#55BE24]' : 'text-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
                        </svg>
                        Đạt {bestScore}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                        Chưa làm
                      </span>
                    )}
                  </div>
                  <Link href={`/de-thi/${exam.id}`}
                    className="mt-auto border-t border-gray-100 pt-5 text-center text-[13px] font-bold text-gray-900 transition-opacity hover:opacity-70">
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
