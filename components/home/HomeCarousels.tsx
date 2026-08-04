'use client'

import Link from 'next/link'
import CarouselWrapper from './CarouselWrapper'
import useHomeUserData from './useHomeUserData'

interface Deck {
  id: string
  tieuDe: string
  _count: { flashcards: number }
}

interface Exam {
  id: string
  tieuDe: string
  level: string
  thoiGianLam: number
  _count: { questions: number }
}

interface Props {
  decks: Deck[]
  exams: Exam[]
}

export default function HomeCarousels({ decks, exams }: Props) {
  const { bestScores, userDeckProgress } = useHomeUserData()

  return (
    <>
      {/* ── NẮM TẤT CẢ CHỦ ĐỀ QUA FLASHCARD ──────────────── */}
      <section className="bg-[#FFF5FB] py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#D946EF] uppercase tracking-wide">
              Nắm tất cả chủ đề qua Flashcard
            </h2>
            <Link href="/flashcard" className="text-sm font-bold text-[#D946EF] hover:underline">
              Xem tất cả
            </Link>
          </div>

          <CarouselWrapper>
            {decks.map((deck) => {
              const totalCards = deck._count.flashcards
              const studiedCards = userDeckProgress[deck.id] || 0

              let status = 'Chưa Bắt Đầu'
              let statusColor = 'text-[#5B5B5B]'
              let dotColor = 'bg-[#5B5B5B]'

              if (studiedCards > 0) {
                if (studiedCards >= totalCards && totalCards > 0) {
                  status = 'Đã Hoàn Thành'
                  statusColor = 'text-[#55BE24]'
                  dotColor = 'bg-[#55BE24]'
                } else {
                  status = 'Đang Học'
                  statusColor = 'text-[#0088FF]'
                  dotColor = 'bg-[#0088FF]'
                }
              }

              return (
                <Link
                  key={deck.id}
                  href={`/flashcard/${deck.id}`}
                  className="group flex shrink-0 w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] min-w-[280px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                >
                  <div className="relative h-44 w-full p-4 pb-2">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70"
                        alt={deck.tieuDe}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col p-5 pt-2">
                    <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#D946EF] line-clamp-2">
                      {deck.tieuDe}
                    </h3>
                    <div className="mb-4 flex items-center gap-5 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                        {deck._count.flashcards} Thẻ
                      </span>
                      <span className={`flex items-center gap-1 ${statusColor}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                      <div className="flex-1 text-center font-bold text-gray-900 pr-10">
                        Bắt Đầu
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D946EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {deck.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 500 + 10}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            {decks.length === 0 && (
              <div className="w-full py-8 text-center text-sm text-gray-400">Chưa có bộ thẻ</div>
            )}
          </CarouselWrapper>
        </div>
      </section>

      {/* ── ĐỀ THI ─────────────────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#D946EF] uppercase tracking-wide">Đề thi</h2>
            <Link href="/de-thi" className="text-sm font-bold text-[#D946EF] hover:underline">
              Xem tất cả
            </Link>
          </div>

          <CarouselWrapper>
            {exams.map((exam) => {
              const bestScore = bestScores[exam.id]
              const daDo = bestScore !== undefined

              return (
                <div
                  key={exam.id}
                  className="relative flex shrink-0 w-[calc(33.333%-16px)] min-w-[280px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow"
                >
                  <div className="absolute top-5 left-5 inline-flex items-center justify-center rounded-full bg-[#C930E0] px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                    {exam.level}
                  </div>
                  <h3 className="mt-8 mb-5 text-base font-bold text-gray-900 line-clamp-2 leading-snug text-center min-h-[40px]">
                    {exam.tieuDe}
                  </h3>
                  <div className="mb-6 flex items-center justify-center gap-3 text-sm font-medium text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#C930E0] shrink-0">
                        <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        <polyline points="12 7 12 12 15 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      {exam.thoiGianLam} Phút
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[#C930E0] shrink-0">
                        <path d="M16 3h-1.5A2.5 2.5 0 0 0 12 1a2.5 2.5 0 0 0-2.5 2.5H8A2.5 2.5 0 0 0 5.5 6v14A2.5 2.5 0 0 0 8 22.5h8a2.5 2.5 0 0 0 2.5-2.5V6A2.5 2.5 0 0 0 16 3z" />
                        <circle cx="12" cy="3.5" r="1.5" fill="white" />
                        <rect x="8.5" y="9" width="7" height="2" fill="white" rx="1" />
                        <rect x="8.5" y="13" width="7" height="2" fill="white" rx="1" />
                        <rect x="8.5" y="17" width="5" height="2" fill="white" rx="1" />
                      </svg>
                      {exam._count.questions} Câu
                    </span>
                    {daDo ? (
                      <span className={`flex items-center gap-1 ${bestScore >= 60 ? 'text-[#55BE24]' : 'text-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
                        </svg>
                        Đạt {bestScore}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Chưa làm
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/de-thi/${exam.id}`}
                    className="mt-auto border-t border-gray-100 pt-5 text-center text-sm font-bold text-gray-900 transition-opacity hover:opacity-70"
                  >
                    {daDo ? 'Làm Lại' : 'Bắt Đầu'}
                  </Link>
                </div>
              )
            })}
            {exams.length === 0 && (
              <div className="w-full py-8 text-center text-sm text-gray-400">Chưa có đề thi</div>
            )}
          </CarouselWrapper>
        </div>
      </section>
    </>
  )
}
