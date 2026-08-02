import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExamSession from '@/components/exam/ExamSession'

export const dynamic = 'force-dynamic'

export default async function DeThiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { id } = await params
  const { preview } = await searchParams

  const exam = await prisma.exam.findFirst({
    where: { 
      id, 
      ...(preview !== '1' && { isPublish: true }) 
    },
    include: {
      questions: {
        orderBy: { thuTu: 'asc' },
        include: {
          // Không select laDapAnDung — bảo mật
          answers: { select: { id: true, noiDung: true } },
        },
      },
    },
  })

  if (!exam) notFound()

  return (
    <ExamSession
      examId={exam.id}
      examTitle={exam.tieuDe}
      thoiGianLam={exam.thoiGianLam}
      questions={exam.questions}
    />
  )
}
