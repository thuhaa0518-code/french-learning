import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import SectionRenderer from '@/components/lesson/SectionRenderer'
import LessonProgressBar from '@/components/lesson/LessonProgressBar'
import LevelBadge from '@/components/shared/LevelBadge'

export const revalidate = 300

const TOPIC_LABELS: Record<string, string> = {
  VOCABULARY: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
  LISTENING: 'Luyện nghe',
  READING: 'Luyện đọc',
}

export default async function BaiHocDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { slug, isPublish: true },
    include: {
      sections: { orderBy: { thuTu: 'asc' } },
    },
  })

  if (!lesson) notFound()

  const { userId } = await auth()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <LevelBadge level={lesson.level} />
          <span className="text-sm text-gray-500">{TOPIC_LABELS[lesson.chuDe] ?? lesson.chuDe}</span>
          {lesson.thoiGianDoc && (
            <span className="ml-auto text-sm text-gray-400">⏱ {lesson.thoiGianDoc} phút</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{lesson.tieuDe}</h1>
        {lesson.anhBia && (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <img src={lesson.anhBia} alt={lesson.tieuDe} className="w-full object-cover" />
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {lesson.sections.map((section) => (
          <SectionRenderer key={section.id} {...section} />
        ))}
      </div>

      {/* Progress tracking for signed-in users */}
      {userId && <LessonProgressBar lessonId={lesson.id} />}
    </div>
  )
}
