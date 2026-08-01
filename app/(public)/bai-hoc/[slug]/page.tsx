import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import SectionRenderer from '@/components/lesson/SectionRenderer'
import LessonProgressBar from '@/components/lesson/LessonProgressBar'

export const dynamic = 'force-dynamic'

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

  // Fetch a related flashcard deck for the sidebar
  const relatedDeck = await prisma.flashcardDeck.findFirst({
    where: { isPublish: true, level: lesson.level },
    include: { _count: { select: { flashcards: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Extract sections for TOC
  const toc = lesson.sections.map((section: any, index: number) => {
    let title = `Phần ${index + 1}`
    try {
      const content = JSON.parse(section.noiDung)
      if (content.title) title = content.title
      else {
        switch (section.loai) {
          case 'TEXT': title = 'Giới thiệu'; break;
          case 'VOCABULARY': title = 'Từ vựng bài học'; break;
          case 'GRAMMAR': title = 'Ngữ pháp'; break;
          case 'MINI_QUIZ': title = 'Mini Quiz'; break;
          case 'VIDEO': title = 'Video'; break;
        }
      }
    } catch (e) {
      // Ignored
    }
    return { id: section.id, title, loai: section.loai }
  })

  const quizCount = lesson.sections.filter((s: any) => s.loai === 'MINI_QUIZ').length

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. Full-width Header Image */}
      {lesson.anhBia && (
        <div className="w-full h-[300px] md:h-[400px] bg-gray-100 overflow-hidden relative">
          <img src={lesson.anhBia} alt={lesson.tieuDe} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Main Content Container */}
      <div className="mx-auto max-w-6xl px-6 mt-8">
        
        {/* Title and Badge */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-4xl font-extrabold text-gray-900 leading-tight">
            {lesson.tieuDe}
          </h1>
          <div className="mt-3 inline-flex items-center gap-1 bg-[#CB30E0] rounded px-3 py-1 text-white font-bold text-sm shadow-sm">
            <span>{lesson.level} - {TOPIC_LABELS[lesson.chuDe] ?? lesson.chuDe}</span>
          </div>
        </div>

        {/* Progress Tracking */}
        {userId && (
          <div className="mb-10 w-full max-w-2xl">
            <LessonProgressBar lessonId={lesson.id} />
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          
          {/* LEFT: Sections Content */}
          <div className="flex flex-col gap-10">
            {lesson.sections.map((section: any) => (
              <div id={`section-${section.id}`} key={section.id} className="scroll-mt-24">
                <SectionRenderer {...section} />
              </div>
            ))}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="flex flex-col gap-8">
            
            {/* Table of Contents */}
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">MỤC LỤC</h3>
              <ul className="flex flex-col gap-3">
                {toc.map((item, idx) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 || idx === 1 ? 'bg-[#CB30E0]' : 'bg-gray-300'}`} />
                    <Link 
                      href={`#section-${item.id}`} 
                      className={`text-sm font-semibold transition-colors ${idx === 0 || idx === 1 ? 'text-[#CB30E0]' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <button className="mt-6 flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:border-[#CB30E0] hover:text-[#CB30E0]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Lưu bài học
              </button>
            </div>

            {/* Information Block */}
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">THÔNG TIN</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex gap-1">
                  <span className="text-gray-500">Cấp độ:</span>
                  <span className="font-bold text-gray-900">{lesson.level}</span>
                </div>
                {lesson.thoiGianDoc && (
                  <div className="flex gap-1">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-bold text-gray-900">{lesson.thoiGianDoc} phút</span>
                  </div>
                )}
                <div className="flex gap-1">
                  <span className="text-gray-500">Chủ đề:</span>
                  <span className="font-bold text-gray-900">{TOPIC_LABELS[lesson.chuDe] ?? lesson.chuDe}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-500">Bài tập:</span>
                  <span className="font-bold text-gray-900">{quizCount} bài</span>
                </div>
              </div>
            </div>

            {/* Related Flashcard */}
            {relatedDeck && (
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">FLASHCARD LIÊN QUAN</h3>
                <div className="rounded-xl border border-gray-200 p-4 bg-white hover:border-[#CB30E0]/30 hover:shadow-sm transition-all">
                  <h4 className="font-bold text-gray-900 line-clamp-2 text-[15px] mb-1">
                    {relatedDeck.tieuDe}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">{relatedDeck._count.flashcards} thẻ</p>
                  <Link 
                    href={`/flashcard/${relatedDeck.id}`}
                    className="text-sm font-bold text-[#CB30E0] hover:opacity-80"
                  >
                    Ôn ngay
                  </Link>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}
