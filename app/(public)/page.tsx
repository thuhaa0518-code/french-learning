import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const revalidate = 300

export default async function HomePage() {
  // Fetch data
  const [lessons, decks, exams] = await Promise.all([
    prisma.lesson.findMany({ where: { isPublish: true }, take: 4, orderBy: { tieuDe: 'asc' } }),
    prisma.flashcardDeck.findMany({ where: { isPublish: true }, take: 2, orderBy: { tieuDe: 'asc' }, include: { _count: { select: { flashcards: true } } } }),
    prisma.exam.findMany({ where: { isPublish: true }, take: 3, orderBy: { tieuDe: 'asc' }, include: { _count: { select: { questions: true } } } }),
  ])

  const featuredLesson = lessons[0]
  const sidebarLessons = lessons.slice(1)

  const TOPIC_ICONS: Record<string, React.ReactNode> = {
    VOCABULARY: (
      <Image src="/icon-vocab.png" alt="Từ vựng" width={24} height={24} className="object-contain mix-blend-multiply" />
    ),
    GRAMMAR: (
      <Image src="/icon-grammar.png" alt="Ngữ pháp" width={24} height={24} className="object-contain mix-blend-multiply" />
    ),
    LISTENING: (
      <Image src="/icon-listening.png" alt="Nghe" width={24} height={24} className="object-contain mix-blend-multiply" />
    ),
    READING: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C5.33 4.5 4.11 4.65 3 5V19.5C3 19.65 3.1 19.8 3.25 19.9C3.3 19.95 3.4 20 3.5 20C3.65 20 3.8 19.9 4 19.85C5.1 19.5 6.2 19.35 7.5 19.35C9.46 19.35 11.56 19.75 13 20.85C14.3 20.15 16.44 19.35 18.5 19.35C19.8 19.35 20.9 19.5 22 19.85C22.2 19.9 22.35 20 22.5 20C22.6 20 22.7 19.95 22.75 19.9C22.9 19.8 23 19.65 23 19.5V5H21ZM21 17C19.9 16.7 18.7 16.5 17.5 16.5C16.2 16.5 14.4 16.9 13 17.5V7.5C14.4 6.9 16.2 6.5 17.5 6.5C18.7 6.5 19.9 6.7 21 7V17Z" fill="#D946EF" />
      </svg>
    ),
  }

  const TOPIC_LABELS: Record<string, string> = {
    VOCABULARY: 'Từ vựng',
    GRAMMAR: 'Ngữ pháp',
    LISTENING: 'Nghe',
    READING: 'Đọc',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-12 lg:px-8">
          {/* Left text */}
          <div className="z-10 w-full max-w-xs shrink-0 pr-8 lg:w-1/2">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
              Apprendre Le{' '}
              <span className="text-primary">Français</span>{' '}
              Autrement.
            </h1>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Học tiếng Pháp với phương pháp hiện đại và hiệu quả. Từng bước tiến bộ cùng FrenchGo.
            </p>
          </div>
          {/* Right image */}
          <div className="absolute right-0 top-0 hidden h-full w-1/2 lg:block">
            <img
              src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80"
              alt="Paris Eiffel Tower"
              className="h-full w-full object-cover rounded-bl-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent rounded-bl-3xl" />
          </div>
        </div>
      </section>

      {/* ── 3 FEATURE CARDS ────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left text */}
            <div className="shrink-0 lg:w-1/4">
              <h2 className="text-2xl font-bold leading-snug text-gray-900 lg:text-3xl">
                Học Khác Đi.<br />Tiến Bộ Thật Sự.
              </h2>
            </div>

            {/* 3 cards */}
            <div className="grid flex-1 grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Card 1 */}
              <div className="group flex h-full flex-col items-center justify-center rounded-[24px] border border-gray-50 bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgb(217,70,239,0.12)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#CB30E0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" />
                  </svg>
                </div>
                <h3 className="mb-4 text-[15px] font-bold text-gray-900 transition-colors group-hover:text-[#D946EF]">Học Dễ Hiểu</h3>
                <p className="text-[13px] text-gray-700 leading-[1.8]">
                  Bài học được biên soạn theo chuẩn CEFR, từ A1 đến B2 với ngôn ngữ Việt Nam thân thiện.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group flex h-full flex-col items-center justify-center rounded-[24px] border border-gray-50 bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgb(217,70,239,0.12)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#CB30E0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16ZM4 22H20V20H4V22Z" />
                  </svg>
                </div>
                <h3 className="mb-4 text-[15px] font-bold text-gray-900 transition-colors group-hover:text-[#D946EF]">Luyện Tập Thực Tế</h3>
                <p className="text-[13px] text-gray-700 leading-[1.8]">
                  Flashcard, mini quiz giữa bài, đề luyện đa dạng sát với chương trình thi.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group flex h-full flex-col items-center justify-center rounded-[24px] border border-gray-50 bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgb(217,70,239,0.12)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#CB30E0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V4H18ZM10 16.5V9.5L16 13L10 16.5Z" />
                  </svg>
                </div>
                <h3 className="mb-4 text-[15px] font-bold text-gray-900 transition-colors group-hover:text-[#D946EF]">Video Chữa Chi Tiết</h3>
                <p className="text-[13px] text-gray-700 leading-[1.8]">
                  Sau mỗi đề thi, giáo viên chữa từng câu qua video, giải thích rõ ràng từng lỗi sai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BÀI HỌC NỔI BẬT ────────────────────────────────── */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary uppercase tracking-wide">Bài học nổi bật</h2>
            <Link href="/bai-hoc" className="text-xs font-medium text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
            {/* Featured card — 2 cols */}
            {featuredLesson && (
              <Link href={`/bai-hoc/${featuredLesson.slug}`}
                className="group col-span-2 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {featuredLesson.anhBia ? (
                    <img src={featuredLesson.anhBia} alt={featuredLesson.tieuDe} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-purple-50">
                      <span className="text-5xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{TOPIC_LABELS[featuredLesson.chuDe] ?? featuredLesson.chuDe}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                    {featuredLesson.tieuDe}
                  </h3>
                </div>
              </Link>
            )}

            {/* Sidebar lessons — 3 cols stacked */}
            <div className="col-span-3 flex flex-col gap-3">
              {sidebarLessons.map((lesson) => (
                <Link key={lesson.id} href={`/bai-hoc/${lesson.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-primary/30 hover:bg-purple-50/40 transition-all">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg shrink-0">{TOPIC_ICONS[lesson.chuDe] ?? '📖'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {lesson.tieuDe}
                    </p>
                    <p className="text-xs text-gray-400">{TOPIC_LABELS[lesson.chuDe] ?? lesson.chuDe}</p>
                  </div>
                </Link>
              ))}
              {sidebarLessons.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">Chưa có bài học</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── NẮM TẤT CẢ CHỦ ĐỀ QUA FLASHCARD ──────────────── */}
      <section className="bg-[#FFF5FB] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#D946EF] uppercase tracking-wide">
              Nắm tất cả chủ đề qua Flashcard
            </h2>
            <Link href="/flashcard" className="text-sm font-bold text-[#D946EF] hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/flashcard/${deck.id}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                <div className="relative h-44 w-full p-4 pb-2">
                  <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70"
                      alt={deck.tieuDe}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="flex flex-col p-5 pt-2">
                  <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#D946EF] line-clamp-2">
                    {deck.tieuDe}
                  </h3>
                  <div className="mb-4 flex items-center gap-5 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                      {deck._count.flashcards} Thẻ
                    </span>
                    <span className="flex items-center gap-1.5 text-green-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Đã Hoàn Thành
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex-1 text-center font-bold text-gray-900 pr-10">
                      Bắt Đầu
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D946EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      251,232
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {decks.length === 0 && (
              <div className="col-span-2 py-8 text-center text-sm text-gray-400">Chưa có bộ thẻ</div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-end gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F4E9F1] text-xs font-bold text-[#D946EF]">‹</span>
            <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-semibold text-gray-900">1</span>
            <Link href="/flashcard?page=2" className="flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-gray-500 hover:bg-gray-100">2</Link>
            <span className="flex h-6 w-6 items-center justify-center text-xs text-gray-400">...</span>
            <Link href="/flashcard" className="flex h-6 w-6 items-center justify-center rounded bg-[#D946EF] text-xs font-bold text-white hover:opacity-90">›</Link>
          </div>
        </div>
      </section>

      {/* ── ĐỀ THI ─────────────────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#D946EF] uppercase tracking-wide">Đề thi</h2>
            <Link href="/de-thi" className="text-sm font-bold text-[#D946EF] hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D946EF] text-sm font-bold text-white">
                  {exam.level}
                </div>
                <h3 className="mb-5 text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug">
                  {exam.tieuDe}
                </h3>
                <div className="mb-6 flex flex-wrap items-center gap-4 text-[11px] font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                    {exam.thoiGianLam} Phút
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                    {exam._count.questions} Câu
                  </span>
                  <span className="flex items-center gap-1.5 text-green-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Đạt 60%
                  </span>
                </div>
                <Link href={`/de-thi/${exam.id}`}
                  className="mt-auto border-t border-gray-100 pt-5 text-center text-[15px] font-bold text-gray-900 transition-opacity hover:opacity-70">
                  Bắt Đầu
                </Link>
              </div>
            ))}
            {exams.length === 0 && (
              <div className="col-span-3 py-8 text-center text-sm text-gray-400">Chưa có đề thi</div>
            )}
          </div>

          {/* Pagination trang chủ — mini */}
          <div className="mt-8 flex justify-end gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F4E9F1] text-xs font-bold text-[#D946EF]">‹</span>
            <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-semibold text-gray-900">1</span>
            <Link href="/de-thi?page=2" className="flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-gray-500 hover:bg-gray-100">2</Link>
            <span className="flex h-6 w-6 items-center justify-center text-xs text-gray-400">...</span>
            <Link href="/de-thi" className="flex h-6 w-6 items-center justify-center rounded bg-[#D946EF] text-xs font-bold text-white hover:opacity-90">›</Link>
          </div>
        </div>
      </section>


    </div>
  )
}

