import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ResultDetail from '@/components/exam/ResultDetail'

export const dynamic = 'force-dynamic'

export default async function KetQuaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <p className="mb-4 text-gray-600 font-medium">Vui lòng đăng nhập để xem kết quả.</p>
          <a href="/sign-in" className="inline-block rounded-xl bg-[#CB30E0] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    )
  }

  const attempt = await prisma.examAttempt.findFirst({
    where: { id, userId: user.id, daNop: true },
    include: {
      exam: { include: { video: true } },
      attemptAnswers: {
        include: { question: true },
      },
    },
  })

  if (!attempt || attempt.diemSo === null) notFound()

  // Build chi_tiet with answer text
  const questions = await prisma.question.findMany({
    where: { examId: attempt.examId },
    include: { answers: true },
    orderBy: { thuTu: 'asc' },
  })

  const chiTiet = attempt.attemptAnswers
    .map((aa: any) => {
      const question = questions.find((q) => q.id === aa.questionId)
      const correctAnswer = question?.answers.find((a) => a.laDapAnDung)
      const studentAnswer = question?.answers.find((a) => a.id === aa.cauTraLoi)

      return {
        questionId: aa.questionId,
        noiDung: question?.noiDung ?? '',
        cauTraLoi: studentAnswer?.noiDung ?? null,
        dapAnDung: correctAnswer?.noiDung ?? '',
        laDung: aa.laDung,
        thuTu: question?.thuTu ?? 0,
      }
    })
    .sort((a, b) => a.thuTu - b.thuTu)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Kết quả bài thi</h1>
      <p className="mb-8 text-sm text-gray-500">{attempt.exam.tieuDe}</p>
      <ResultDetail
        diemSo={attempt.diemSo}
        chiTiet={chiTiet}
        examTitle={attempt.exam.tieuDe}
        videoId={attempt.exam.video?.youtubeId}
        attemptId={attempt.id}
      />
    </div>
  )
}
