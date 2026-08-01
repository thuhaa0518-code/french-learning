'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastProvider'

const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30'

interface Answer { noi_dung: string; la_dap_an_dung: boolean }
interface Question { noi_dung: string; giai_thich: string; answers: Answer[] }

interface Props {
  examId?: string
  defaultValues?: { tieuDe: string; moTa: string; level: string; thoiGianLam: number; isPublish: boolean; questions: Question[]; videoUrl?: string }
}

function emptyQuestion(): Question {
  return {
    noi_dung: '',
    giai_thich: '',
    answers: [
      { noi_dung: '', la_dap_an_dung: true },
      { noi_dung: '', la_dap_an_dung: false },
      { noi_dung: '', la_dap_an_dung: false },
      { noi_dung: '', la_dap_an_dung: false },
    ],
  }
}

const LABELS = ['A', 'B', 'C', 'D']

export default function ExamForm({ examId, defaultValues }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showVideoDeleteConfirm, setShowVideoDeleteConfirm] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null)

  const [tieuDe, setTieuDe] = useState(defaultValues?.tieuDe ?? '')
  const [moTa, setMoTa] = useState(defaultValues?.moTa ?? '')
  const [level, setLevel] = useState(defaultValues?.level ?? 'A1')
  const [thoiGianLam, setThoiGianLam] = useState(defaultValues?.thoiGianLam ?? 45)
  const [videoUrl, setVideoUrl] = useState(defaultValues?.videoUrl ?? '')
  const [questions, setQuestions] = useState<Question[]>(defaultValues?.questions ?? [emptyQuestion()])
  const [questionErrors, setQuestionErrors] = useState<Record<number, { noiDung?: string, dapAn?: string }>>({})

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()])

  const removeQuestion = (i: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
    setQuestionErrors(prev => {
      const next = { ...prev }
      delete next[i]
      return next
    })
  }

  const updateQuestion = (i: number, key: keyof Question, val: string) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [key]: val } : q))
    if (key === 'noi_dung') {
      setQuestionErrors(prev => ({ ...prev, [i]: { ...prev[i], noiDung: undefined } }))
    }
  }

  const updateAnswer = (qi: number, ai: number, val: string) => {
    setQuestions(prev => prev.map((q, idx) => idx === qi
      ? { ...q, answers: q.answers.map((a, aidx) => aidx === ai ? { ...a, noi_dung: val } : a) }
      : q))
    setQuestionErrors(prev => ({ ...prev, [qi]: { ...prev[qi], dapAn: undefined } }))
  }

  const setCorrectAnswer = (qi: number, ai: number) => {
    setQuestions(prev => prev.map((q, idx) => idx === qi
      ? { ...q, answers: q.answers.map((a, aidx) => ({ ...a, la_dap_an_dung: aidx === ai })) }
      : q))
    setQuestionErrors(prev => ({ ...prev, [qi]: { ...prev[qi], dapAn: undefined } }))
  }

  const validateYouTubeVideo = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const m = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)
      if (!m) return resolve(false)
      const ytId = m[1]
      const img = new Image()
      img.onload = () => resolve(img.width > 120)
      img.onerror = () => resolve(false)
      img.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, skipVideoCheck = false) => {
    e.preventDefault()
    
    // Validate inline
    let hasError = false
    const newErrors: Record<number, { noiDung?: string, dapAn?: string }> = {}

    questions.forEach((q, i) => {
      const err: { noiDung?: string, dapAn?: string } = {}
      if (!q.noi_dung.trim()) {
        err.noiDung = 'Câu hỏi không được để trống'
        hasError = true
      }
      if (!q.answers.some(a => a.la_dap_an_dung && a.noi_dung.trim())) {
        err.dapAn = 'Vui lòng chọn đáp án đúng'
        hasError = true
      }
      if (err.noiDung || err.dapAn) {
        newErrors[i] = err
      }
    })

    if (hasError) {
      setQuestionErrors(newErrors)
      return
    }

    // Validate YouTube URL
    if (videoUrl) {
      const m = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([A-Za-z0-9_-]{11})/)
      if (!m) {
        toast('Đường dẫn YouTube không hợp lệ', 'error')
        return
      }

      // Check if video exists
      setSaving(true)
      const isValid = await validateYouTubeVideo(videoUrl)
      if (!isValid) {
        toast('Video không còn tồn tại trên YouTube', 'error')
        setSaving(false)
        return
      }
      setSaving(false)
    }

    // Intercept video deletion
    if (defaultValues?.videoUrl && !videoUrl && !skipVideoCheck) {
      setPendingEvent(e)
      setShowVideoDeleteConfirm(true)
      return
    }

    const action = (e.nativeEvent as SubmitEvent)?.submitter || document.activeElement
    const isPublish = (action as HTMLButtonElement)?.value === 'publish'
    setSaving(true); setError('')

    try {
      // 1. Tạo đề thi
      const examRes = await fetch(examId ? `/api/de-thi/${examId}` : '/api/de-thi', {
        method: examId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tieuDe, moTa: moTa || undefined, level, thoiGianLam, isPublish, videoUrl: videoUrl || undefined }),
      })
      const examData = await examRes.json()
      if (!examRes.ok) { setError(examData.error?.message ?? 'Không thể tạo đề thi'); return }

      const newExamId = examId ?? examData.data?.exam?.id
      if (!newExamId) { setError('Không lấy được exam ID'); return }

      // 2. Thêm câu hỏi
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await fetch(`/api/de-thi/${newExamId}/cau-hoi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loai: 'MULTIPLE_CHOICE',
            noiDung: q.noi_dung,
            giaiThich: q.giai_thich || undefined,
            thuTu: i,
            dapAn: q.answers.map(a => ({ noiDung: a.noi_dung, laDapAnDung: a.la_dap_an_dung })),
          }),
        })
      }

      if (examId) {
        toast('Cập nhật thành công!', 'success')
      } else if (isPublish) {
        toast('Đăng bài thành công', 'success')
      } else {
        toast('Lưu nháp thành công', 'success')
      }

      router.push('/admin/de-thi')
      router.refresh()
    } catch {
      toast('Không thể kết nối server', 'error')
      setError('Không thể kết nối server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="exam-form" onSubmit={handleSubmit}>
      <div className="max-w-4xl px-6 py-2 flex flex-col gap-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* Tiêu đề */}
        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Tiêu đề đề thi</label>
          <input required value={tieuDe} onChange={e => setTieuDe(e.target.value)} className={INPUT} placeholder="VD: DELF A1 - Đề thử nghiệm số 1" />
        </div>

        {/* Mô tả */}
        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Mô tả</label>
          <textarea rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} className={INPUT + ' resize-none'} placeholder="Mô tả ngắn về đề thi..." />
        </div>

        {/* Cấp độ + Thời gian */}
        <div className="flex gap-6">
          <div className="w-28">
            <label className="mb-1.5 block text-[15px] font-semibold text-gray-700">Cấp độ</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary">
              {['A1', 'A2', 'B1', 'B2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="mb-1.5 block text-[15px] font-semibold text-gray-700 whitespace-nowrap">Thời gian làm (phút)</label>
            <input type="number" min={1} value={thoiGianLam} onChange={e => setThoiGianLam(parseInt(e.target.value) || 45)} className="w-full rounded-lg border border-gray-200 px-2 py-2 text-[15px] outline-none focus:border-primary" />
          </div>
        </div>

        {/* Video giải đề */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="mb-3 block text-[15px] font-semibold text-gray-700">Video giải đề (tuỳ chọn)</label>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">URL YouTube</label>
              <div className="flex gap-2">
                <input
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className={INPUT}
                  placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                />
                {videoUrl && (
                  <button type="button" onClick={() => setVideoUrl('')} className="shrink-0 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">Xoá</button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Video sẽ hiện sau khi học viên nộp bài</p>
            </div>
          </div>

          {/* YouTube preview */}
          {(() => {
            const m = videoUrl.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)
            const ytId = m ? m[1] : null
            if (!ytId) return null
            return (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="thumbnail" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">Video đã liên kết</p>
                  <p className="truncate text-xs text-gray-400">ID: {ytId}</p>
                  <a href={`https://youtube.com/watch?v=${ytId}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline">Xem trên YouTube ↗</a>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Danh sách câu hỏi */}
        <div>
          <label className="mb-3 block text-[15px] font-semibold text-gray-700">Danh sách câu hỏi ({questions.length})</label>
          <div className="flex flex-col gap-4">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab text-[#5B5B5B] hover:opacity-70 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                      </svg>
                    </span>
                    <span className="flex h-[22px] min-w-[22px] px-1 items-center justify-center rounded-[10px] border border-[#CB30E0] text-xs font-bold text-[#CB30E0]" style={{ backgroundColor: 'rgba(203, 48, 224, 0.1)' }}>{qi + 1}</span>
                    <span className="text-xs font-medium text-gray-500">Câu hỏi {qi + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} className="text-black hover:opacity-70 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" width="14" height="18"><path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" /></svg>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Câu hỏi */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Nội dung câu hỏi</label>
                    <textarea rows={2} value={q.noi_dung} onChange={e => updateQuestion(qi, 'noi_dung', e.target.value)} className={`${INPUT} resize-none ${questionErrors[qi]?.noiDung ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="Nhập câu hỏi..." />
                    {questionErrors[qi]?.noiDung && <p className="mt-1 text-sm font-semibold text-red-500">{questionErrors[qi].noiDung}</p>}
                  </div>

                  {/* Đáp án */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-500">Đáp án (click chữ cái để chọn đáp án đúng)</label>
                    <div className="flex flex-col gap-2">
                      {q.answers.map((a, ai) => (
                        <div key={ai} className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${a.la_dap_an_dung ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <button
                            type="button"
                            onClick={() => setCorrectAnswer(qi, ai)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${a.la_dap_an_dung ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'}`}
                          >
                            {LABELS[ai]}
                          </button>
                          <input
                            value={a.noi_dung}
                            onChange={e => updateAnswer(qi, ai, e.target.value)}
                            className={`flex-1 bg-transparent text-sm outline-none ${a.la_dap_an_dung ? 'text-green-800 font-medium' : 'text-gray-700'}`}
                            placeholder={`Đáp án ${LABELS[ai]}...`}
                          />
                        </div>
                      ))}
                    </div>
                    {questionErrors[qi]?.dapAn && <p className="mt-2 text-sm font-semibold text-red-500">{questionErrors[qi].dapAn}</p>}
                  </div>

                  {/* Giải thích */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Giải thích (hiện sau khi nộp bài)</label>
                    <input value={q.giai_thich} onChange={e => updateQuestion(qi, 'giai_thich', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Giải thích tại sao đáp án này đúng..." />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 py-4 text-base font-bold text-black transition-colors hover:border-gray-400"
          >
            + Thêm câu hỏi mới
          </button>
        </div>

        {saving && <p className="text-center text-sm text-primary">Đang xử lý...</p>}
      </div>

      <Modal
        isOpen={showVideoDeleteConfirm}
        onClose={() => setShowVideoDeleteConfirm(false)}
        title="Gỡ video"
        type="danger"
        footer={
          <>
            <button onClick={() => setShowVideoDeleteConfirm(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              Huỷ
            </button>
            <button onClick={() => { setShowVideoDeleteConfirm(false); if (pendingEvent) handleSubmit(pendingEvent, true) }} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600">
              Xác nhận
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="text-[15px] text-gray-700 font-medium">Xóa video sẽ gỡ liên kết với đề thi - Xác nhận?</p>
        </div>
      </Modal>
    </form>
  )
}
