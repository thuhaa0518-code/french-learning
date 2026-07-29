'use client'

import { useState } from 'react'

interface FlashcardFlipProps {
  tuPhap: string
  nghiaViet: string
  phatAm?: string | null
  viDu?: string | null
  audioUrl?: string | null
  onRate?: (rating: 'De' | 'Kho' | 'Lam_lai') => void
  isShuffled?: boolean
  onToggleShuffle?: () => void
  isStarred?: boolean
  onToggleStar?: () => void
}

export default function FlashcardFlip({ tuPhap, nghiaViet, phatAm, viDu, audioUrl, onRate, isShuffled, onToggleShuffle, isStarred, onToggleStar }: FlashcardFlipProps) {
  const [flipped, setFlipped] = useState(false)

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioUrl) return
    new Audio(audioUrl).play().catch(() => {})
  }

  return (
    <div className="relative flex gap-4">
      {/* Card */}
      <div
        className="flex-1 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '320px',
          }}
        >
          {/* Front — white */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 shadow-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Top icons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleShuffle?.()
              }}
              title={isShuffled ? "Tắt xáo trộn" : "Xáo trộn thẻ"}
              aria-label="Xáo trộn thẻ"
              className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isShuffled ? '#CB30E0' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar?.()
              }}
              title={isStarred ? "Bỏ đánh dấu" : "Đánh dấu thẻ"}
              aria-label="Đánh dấu thẻ"
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isStarred ? '#CB30E0' : 'none'} stroke={isStarred ? '#CB30E0' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>

            <p className="text-4xl font-bold text-gray-900 text-center mb-3">{tuPhap}</p>
            {phatAm && <p className="text-base text-gray-400 italic mb-4">{phatAm}</p>}

            <button onClick={playAudio} className="mb-6 text-gray-500 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </button>

            <p className="text-xs text-gray-400 italic">Nhấn để xem nghĩa</p>
          </div>

          {/* Back — purple */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-8 shadow-sm"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: '#F3E8FF' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleShuffle?.()
              }}
              title={isShuffled ? "Tắt xáo trộn" : "Xáo trộn thẻ"}
              aria-label="Xáo trộn thẻ"
              className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-purple-200/60 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isShuffled ? '#CB30E0' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar?.()
              }}
              title={isStarred ? "Bỏ đánh dấu" : "Đánh dấu thẻ"}
              aria-label="Đánh dấu thẻ"
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-purple-200/60 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isStarred ? '#CB30E0' : 'none'} stroke={isStarred ? '#CB30E0' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>

            <p className="text-3xl font-bold text-gray-900 text-center mb-2">{nghiaViet}</p>
            {viDu && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 italic">« {viDu} »</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons — shown when flipped */}
      {flipped && onRate && (
        <div className="flex flex-col gap-3 justify-center">
          <button onClick={() => onRate('De')}
            className="w-20 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#55BE24' }}>
            Dễ
          </button>
          <button onClick={() => onRate('Kho')}
            className="w-20 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F51A1A' }}>
            Khó
          </button>
          <button onClick={() => onRate('Lam_lai')}
            className="w-20 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#CB30E0' }}>
            Làm lại
          </button>
        </div>
      )}
    </div>
  )
}
