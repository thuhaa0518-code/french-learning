import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProgressSummary from '@/components/dashboard/ProgressSummary'
import ExamHistory from '@/components/dashboard/ExamHistory'
import FlashcardStats from '@/components/dashboard/FlashcardStats'
import ProfileCard from '@/components/dashboard/ProfileCard'
import EmptyState from '@/components/shared/EmptyState'
import { isDueForReview } from '@/lib/sm2'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <p className="mb-4 text-gray-600 font-medium">Vui lòng đăng nhập để xem bảng điều khiển.</p>
          <a href="/sign-in" className="inline-block rounded-xl bg-[#CB30E0] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    )
  }

  // Parallel fetch
  const [progresses, attempts, flashcardStates, totalLessons] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId: user.id } }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, daNop: true },
      include: { exam: { select: { tieuDe: true } } },
      orderBy: { thoiGianNop: 'desc' },
      take: 10,
    }),
    prisma.flashcardState.findMany({ where: { userId: user.id } }),
    prisma.lesson.count({ where: { isPublish: true } }),
  ])

  const completed = progresses.filter((p: any) => p.daHoanThanh).length
  const inProgress = progresses.filter((p: any) => !p.daHoanThanh && p.phanTram > 0).length
  const notStarted = Math.max(0, totalLessons - progresses.length)

  const now = new Date()
  const dueToday = flashcardStates.filter((s: any) =>
    isDueForReview(s.updatedAt, s.soNgayNhacLai, now),
  ).length

  const uniqueDecks = new Set(
    flashcardStates.map((s: any) => s.flashcardId),
  ).size

  const hasActivity = progresses.length > 0 || attempts.length > 0 || flashcardStates.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile card */}
      <ProfileCard
        tenHienThi={user.tenHienThi}
        email={user.email}
        vaiTro={user.vaiTro}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Theo dõi tiến độ học tập của bạn</p>
      </div>

      {!hasActivity ? (
        <EmptyState
          title="Chưa có hoạt động học tập"
          description="Bắt đầu học bài đầu tiên của bạn ngay hôm nay!"
          actionLabel="Khám phá bài học"
          actionHref="/bai-hoc"
          icon=""
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProgressSummary
              completed={completed}
              inProgress={inProgress}
              notStarted={notStarted}
              total={totalLessons}
            />
            <ExamHistory
              attempts={attempts.map((a: any) => ({
                id: a.id,
                examTitle: a.exam.tieuDe,
                diemSo: a.diemSo ?? 0,
                thoiGianNop: a.thoiGianNop,
              }))}
            />
          </div>
          <div>
            <FlashcardStats deckCount={uniqueDecks} dueToday={dueToday} />
          </div>
        </div>
      )}
    </div>
  )
}
