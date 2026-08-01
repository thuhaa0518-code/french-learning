import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExamForm from '@/components/admin/ExamForm'

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
    <div className="flex h-full flex-col">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[23px] font-extrabold tracking-wide text-primary">
          <Link href="/admin/de-thi" className="uppercase hover:underline">QUẢN LÝ ĐỀ THI</Link>
          <span className="text-primary">»</span>
          <span>Chỉnh sửa</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/de-thi/${id}`} target="_blank" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Preview</Link>
          <button form="exam-form" name="action" value="draft" type="submit" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Lưu bản nháp</button>
          <button form="exam-form" name="action" value="publish" type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#CB30E0' }}>Đăng bài</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ExamForm
          examId={id}
          defaultValues={{
            tieuDe: exam.tieuDe,
            moTa: exam.moTa ?? '',
            level: exam.level as 'A1' | 'A2' | 'B1' | 'B2',
            thoiGianLam: exam.thoiGianLam,
            isPublish: exam.isPublish,
            videoUrl: exam.videoId ? `https://youtube.com/watch?v=${exam.videoId}` : undefined,
            questions: exam.questions.map((q) => ({
              noi_dung: q.noiDung,
              giai_thich: q.giaiThich ?? '',
              answers: q.answers.map((a) => ({
                noi_dung: a.noiDung,
                la_dap_an_dung: a.laDapAnDung,
              })),
            })),
          }}
        />
      </div>
    </div>
  )
}
