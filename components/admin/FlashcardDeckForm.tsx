'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

interface CardRow { tuPhap: string; phatAm: string; nghiaViet: string; viDu: string; audioFile?: File | string }

const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30'

interface Props { deckId?: string; defaultValues?: { tieuDe: string; moTa: string; level: string; isPublish: boolean; cards: CardRow[] } }

export default function FlashcardDeckForm({ deckId, defaultValues }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [cardErrors, setCardErrors] = useState<Record<number, { tuPhap?: string, nghiaViet?: string, audio?: string }>>({})

  const [tieuDe, setTieuDe] = useState(defaultValues?.tieuDe ?? '')
  const [moTa, setMoTa] = useState(defaultValues?.moTa ?? '')
  const [level, setLevel] = useState(defaultValues?.level ?? 'A1')
  const [cards, setCards] = useState<CardRow[]>(defaultValues?.cards ?? [{ tuPhap: '', phatAm: '', nghiaViet: '', viDu: '' }])

  const addCard = () => setCards(prev => [...prev, { tuPhap: '', phatAm: '', nghiaViet: '', viDu: '' }])
  const removeCard = (i: number) => setCards(prev => prev.filter((_, idx) => idx !== i))
  const updateCard = (i: number, key: keyof CardRow, val: string) => setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const action = (e.nativeEvent as SubmitEvent).submitter || document.activeElement
    const isPublish = (action as HTMLButtonElement)?.value === 'publish'
    
    // Inline validation
    let hasError = false
    const errors: Record<number, { tuPhap?: string, nghiaViet?: string, audio?: string }> = {}

    cards.forEach((card, i) => {
      const err: { tuPhap?: string, nghiaViet?: string, audio?: string } = {}
      if (!card.tuPhap.trim()) { err.tuPhap = 'Vui lòng nhập từ tiếng Pháp'; hasError = true }
      if (!card.nghiaViet.trim()) { err.nghiaViet = 'Vui lòng nhập nghĩa tiếng Việt'; hasError = true }
      if (card.audioFile instanceof File && card.audioFile.size > 5 * 1024 * 1024) {
        err.audio = 'File audio vượt quá 5MB'
        hasError = true
      }
      if (Object.keys(err).length > 0) { errors[i] = err }
    })

    if (hasError) {
      setCardErrors(errors)
      return
    }

    setSaving(true); setError('')

    try {
      // 1. Tạo/cập nhật deck
      const deckRes = await fetch(deckId ? `/api/flashcard/bo-the/${deckId}` : '/api/flashcard/bo-the', {
        method: deckId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tieuDe, moTa: moTa || undefined, level, isPublish }),
      })
      const deckData = await deckRes.json()
      if (!deckRes.ok) { setError(deckData.error?.message ?? 'Không thể tạo bộ thẻ'); return }

      const newDeckId = deckId ?? deckData.data?.deck?.id
      if (!newDeckId) { setError('Không lấy được deck ID'); return }

      // 2. Thêm các thẻ
      for (const card of cards) {
        if (!card.tuPhap.trim() || !card.nghiaViet.trim()) continue
        await fetch('/api/flashcard/the', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deckId: newDeckId, tuPhap: card.tuPhap, nghiaViet: card.nghiaViet, phatAm: card.phatAm || undefined, viDu: card.viDu || undefined }),
        })
      }

      toast('Lưu thành công!', 'success')
      router.push('/admin/flashcard')
      router.refresh()
    } catch {
      setError('Không thể kết nối server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="deck-form" onSubmit={handleSubmit}>
      <div className="max-w-4xl px-6 py-2 flex flex-col gap-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* Tiêu đề */}
        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Tiêu đề bộ thẻ</label>
          <input required value={tieuDe} onChange={e => setTieuDe(e.target.value)} className={INPUT} placeholder="Tiêu đề bộ thẻ" />
        </div>

        {/* Mô tả */}
        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Mô tả ngắn</label>
          <textarea rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} className={INPUT + ' resize-none'} placeholder="Tóm tắt 1-2 câu về nội dung bộ thẻ" />
        </div>

        {/* Cấp độ + Chủ đề */}
        <div className="flex gap-6">
          <div className="w-28">
            <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Cấp độ</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary">
              {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Chủ đề</label>
            <select className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary">
              <option>Từ vựng</option>
              <option>Ngữ pháp</option>
            </select>
          </div>
        </div>

        {/* Danh sách thẻ */}
        <div>
          <label className="mb-3 block text-[15px] font-semibold text-gray-700">Danh sách thẻ ({cards.length})</label>
          <div className="flex flex-col gap-3">
            {cards.map((card, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab text-[#5B5B5B] hover:opacity-70 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                      </svg>
                    </span>
                    <span className="flex h-[22px] min-w-[22px] px-1 items-center justify-center rounded-[10px] border border-[#CB30E0] text-xs font-bold text-[#CB30E0]" style={{ backgroundColor: 'rgba(203, 48, 224, 0.1)' }}>{i + 1}</span>
                  </div>
                  <button type="button" onClick={() => removeCard(i)} className="text-black hover:opacity-70 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" width="14" height="18"><path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" /></svg>
                  </button>
                </div>

                {/* Card content */}
                <div className="flex gap-4 p-4">
                  {/* Preview mặt trước */}
                  <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
                    {card.tuPhap || 'Từ pháp'}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-black">Tiếng Pháp</label>
                        <input value={card.tuPhap} onChange={e => { updateCard(i, 'tuPhap', e.target.value); setCardErrors(p => ({...p, [i]: {...p[i], tuPhap: undefined}})) }} className={`w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:border-primary ${cardErrors[i]?.tuPhap ? 'border-red-500' : 'border-gray-200'}`} placeholder="Bonjour" />
                        {cardErrors[i]?.tuPhap && <p className="mt-1 text-[11px] font-semibold text-red-500">{cardErrors[i].tuPhap}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-black">IPA</label>
                        <input value={card.phatAm} onChange={e => updateCard(i, 'phatAm', e.target.value)} className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary" placeholder="/bɔ̃ʒuʁ/" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-black">Tiếng Việt</label>
                        <input value={card.nghiaViet} onChange={e => { updateCard(i, 'nghiaViet', e.target.value); setCardErrors(p => ({...p, [i]: {...p[i], nghiaViet: undefined}})) }} className={`w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:border-primary ${cardErrors[i]?.nghiaViet ? 'border-red-500' : 'border-gray-200'}`} placeholder="Xin chào" />
                        {cardErrors[i]?.nghiaViet && <p className="mt-1 text-[11px] font-semibold text-red-500">{cardErrors[i].nghiaViet}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-black">Ví dụ</label>
                        <input value={card.viDu} onChange={e => updateCard(i, 'viDu', e.target.value)} className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary" placeholder="Bonjour, bienvenue chez nous." />
                      </div>
                      <div className="w-48">
                        <label className="mb-1 block text-xs font-medium text-black">Audio (MP3)</label>
                        <input type="file" accept="audio/mpeg" onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.type !== 'audio/mpeg') {
                              setCardErrors(p => ({...p, [i]: {...p[i], audio: 'Định dạng không hỗ trợ. Chấp nhận: MP3'}}))
                              return
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setCardErrors(p => ({...p, [i]: {...p[i], audio: 'File audio vượt quá 5MB'}}))
                              return
                            }
                            // Valid
                            setCardErrors(p => ({...p, [i]: {...p[i], audio: undefined}}))
                            setCards(prev => prev.map((c, idx) => idx === i ? { ...c, audioFile: file } : c))
                          }
                        }} className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs file:font-semibold hover:file:bg-gray-200" />
                        {cardErrors[i]?.audio && <p className="mt-1 text-[11px] font-semibold text-red-500">{cardErrors[i].audio}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCard}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 py-4 text-base font-bold text-black transition-colors hover:border-gray-400"
          >
            + Thêm thẻ mới
          </button>
        </div>

        {saving && <p className="text-center text-sm text-primary">Đang lưu...</p>}
      </div>
    </form>
  )
}
