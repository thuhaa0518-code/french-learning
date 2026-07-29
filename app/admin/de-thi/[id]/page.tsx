import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDeThiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { thuTu: 'asc' },
        include: { answers: true },
      },
    },
  })

  if (!exam) notFound()

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{exam.tieuDe}</h1>
      <p className="mb-8 text-sm text-gray-500">{exam.questions.length} câu hỏi • {exam.thoiGianLam} phút</p>

      <div className="flex flex-col gap-6">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="mb-4 font-semibold text-gray-900">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white font-bold">
                {idx + 1}
              </span>
              {q.noiDung}
            </p>
            <div className="pl-8 flex flex-col gap-2">
              {q.answers.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${a.laDapAnDung ? 'bg-green-50 text-green-700 font-medium' : 'bg-gray-50 text-gray-600'}`}
                >
                  {a.laDapAnDung && <span>✓</span>}
                  {a.noiDung}
                </div>
              ))}
            </div>
            {q.giaiThich && (
              <p className="mt-3 pl-8 text-xs text-gray-500 italic">💡 {q.giaiThich}</p>
            )}
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
            Chưa có câu hỏi. Dùng API POST /api/de-thi/{id}/cau-hoi để thêm câu hỏi.
          </div>
        )}
      </div>
    </div>
  )
}
