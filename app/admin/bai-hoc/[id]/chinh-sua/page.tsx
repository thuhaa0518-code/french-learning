import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LessonForm from '@/components/admin/LessonForm'

export const dynamic = 'force-dynamic'

export default async function ChinhSuaBaiHocPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { sections: { orderBy: { thuTu: 'asc' } } },
  })

  if (!lesson) notFound()

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Chỉnh sửa bài học</h1>
      <LessonForm
        lessonId={id}
        defaultValues={{
          tieuDe: lesson.tieuDe,
          level: lesson.level as 'A1' | 'A2' | 'B1' | 'B2',
          chuDe: lesson.chuDe as 'VOCABULARY' | 'GRAMMAR' | 'LISTENING' | 'READING',
          anhBia: lesson.anhBia ?? '',
          thoiGianDoc: lesson.thoiGianDoc,
          isPublish: lesson.isPublish,
          sections: lesson.sections.map((s) => ({
            loai: s.loai as 'TEXT' | 'VOCABULARY' | 'GRAMMAR' | 'VIDEO' | 'MINI_QUIZ',
            data: s.noiDung ? JSON.parse(s.noiDung) : undefined,
            thuTu: s.thuTu,
          })),
        }}
      />
    </div>
  )
}
