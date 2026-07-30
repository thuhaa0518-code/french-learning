'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FlashcardFlip from './FlashcardFlip'

interface Flashcard {
  id: string
  tuPhap: string
  nghiaViet: string
  phatAm?: string | null
  viDu?: string | null
  audioUrl?: string | null
}

interface StudySessionProps {
  deck: {
    id: string
    tieuDe: string
    flashcards: Flashcard[]
  }
}

export default function StudySession({ deck }: StudySessionProps) {
  const [current, setCurrent] = useState(0)
  const [stats, setStats] = useState({ de: 0, kho: 0, lamLai: 0 })
  const [done, setDone] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [initialCards, setInitialCards] = useState<Flashcard[]>(deck.flashcards)
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([])
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())
  const [starredIds, setStarredIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`starred_deck_${deck.id}`)
      if (saved) setStarredIds(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [deck.id])

  const toggleStar = (cardId: string) => {
    setStarredIds((prev) => {
      const next = prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      try {
        localStorage.setItem(`starred_deck_${deck.id}`, JSON.stringify(next))
      } catch { /* ignore */ }
      return next
    })
  }

  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = [...deck.flashcards].sort(() => Math.random() - 0.5)
      setInitialCards(shuffled)
      setIsShuffled(true)
    } else {
      setInitialCards(deck.flashcards)
      setIsShuffled(false)
    }
    setCurrent(0)
    setReviewQueue([])
    setReviewedIds(new Set())
    setDone(false)
  }

  const cards = [...initialCards, ...reviewQueue]

  const handleRate = async (rating: 'De' | 'Kho' | 'Lam_lai') => {
    try {
      await fetch('/api/flashcard/danh-gia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcard_id: cards[current].id, danh_gia: rating }),
      })
    } catch { /* ignore */ }

    setStats((prev) => ({
      de: prev.de + (rating === 'De' ? 1 : 0),
      kho: prev.kho + (rating === 'Kho' ? 1 : 0),
      lamLai: prev.lamLai + (rating === 'Lam_lai' ? 1 : 0),
    }))

    const currentCard = cards[current]
    const isStarred = starredIds.includes(currentCard.id)
    const needsReview = rating === 'Kho' || rating === 'Lam_lai' || isStarred
    const willAdd = needsReview && !reviewedIds.has(currentCard.id)

    if (willAdd) {
      setReviewQueue((prev) => [...prev, currentCard])
      setReviewedIds((prev) => new Set(prev).add(currentCard.id))
    }

    const nextLength = cards.length + (willAdd ? 1 : 0)

    if (current + 1 >= nextLength) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">Bộ thẻ này chưa có thẻ nào</div>
    )
  }

  const progress = done ? 100 : Math.round((current / cards.length) * 100)
  const displayIndex = Math.min(current, cards.length - 1)
  const card = cards[displayIndex] || cards[0]

  return (
    <div className="relative">
      {/* Background Study Screen (Blurred when done) */}
      <div className={done ? 'pointer-events-none blur-md opacity-40 transition-all duration-500 select-none' : 'transition-all duration-500'}>
        {/* Counter + deck name */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-gray-500">{displayIndex + 1}/{cards.length}</p>
          <p className="text-base font-semibold text-gray-900">{deck.tieuDe}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Card */}
        <FlashcardFlip
          key={`${card.id}-${current}`}
          tuPhap={card.tuPhap}
          nghiaViet={card.nghiaViet}
          phatAm={card.phatAm}
          viDu={card.viDu}
          audioUrl={card.audioUrl}
          onRate={handleRate}
          isShuffled={isShuffled}
          onToggleShuffle={toggleShuffle}
          isStarred={starredIds.includes(card.id)}
          onToggleStar={() => toggleStar(card.id)}
        />

        {/* Navigation */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0 || done}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 disabled:opacity-30 hover:border-primary hover:text-primary transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => {
              if (current >= cards.length - 1) {
                setDone(true)
              } else {
                setCurrent((c) => c + 1)
              }
            }}
            disabled={done}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 disabled:opacity-30 hover:border-primary hover:text-primary transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Premium Completion Popup Modal */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
            {/* Background Glows */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

            {/* Title & Description */}
            <div className="text-center mb-8 mt-2">
              <h3 className="text-2xl font-black tracking-tight text-[#CB30E0] sm:text-3xl">
                Chúc mừng hoàn thành!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Bạn đã ôn luyện xuất sắc <span className="font-semibold text-gray-800">{cards.length} thẻ vựng</span> trong bộ <span className="font-semibold text-primary">{deck.tieuDe}</span>.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {/* Dễ */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50/60 p-5 transition-transform hover:scale-105">
                <span className="text-3xl font-black text-green-600 mb-1">{stats.de}</span>
                <span className="whitespace-nowrap text-xs font-semibold text-green-700/80">Dễ thuộc ({Math.round((stats.de / cards.length) * 100) || 0}%)</span>
              </div>

              {/* Khó */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 p-5 transition-transform hover:scale-105">
                <span className="text-3xl font-black text-red-600 mb-1">{stats.kho}</span>
                <span className="whitespace-nowrap text-xs font-semibold text-red-700/80">Chưa thuộc ({Math.round((stats.kho / cards.length) * 100) || 0}%)</span>
              </div>

              {/* Làm lại */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-100 bg-purple-50/60 p-5 transition-transform hover:scale-105">
                <span className="text-3xl font-black text-[#CB30E0] mb-1">{stats.lamLai}</span>
                <span className="whitespace-nowrap text-xs font-semibold text-purple-700/80">Cần ôn lại ({Math.round((stats.lamLai / cards.length) * 100) || 0}%)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { 
                  setCurrent(0); 
                  setDone(false); 
                  setStats({ de: 0, kho: 0, lamLai: 0 });
                  setReviewQueue([]);
                  setReviewedIds(new Set());
                }}
                className="flex-1 rounded-2xl bg-[#CB30E0] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-[#CB30E0]/30 hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Học lại từ đầu
              </button>
              <Link
                href="/flashcard"
                className="flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-3.5 px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Về danh sách
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
