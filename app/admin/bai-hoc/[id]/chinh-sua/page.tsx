import Link from 'next/link'
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
    <div className="flex h-full flex-col">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[23px] font-extrabold tracking-wide text-primary">
          <Link href="/admin/bai-hoc" className="uppercase hover:underline">
            QUẢN LÝ BÀI HỌC
          </Link>
          <span className="text-primary">»</span>
          <span>Chỉnh sửa</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/bai-hoc/${lesson.slug}`}
            target="_blank"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Preview
          </Link>
          <button
            form="lesson-form"
            name="action"
            value="draft"
            type="submit"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Lưu bản nháp
          </button>
          <button
            form="lesson-form"
            name="action"
            value="publish"
            type="submit"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#CB30E0' }}
          >
            Đăng bài
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
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
    </div>
  )
}
