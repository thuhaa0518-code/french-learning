'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastProvider'

interface Answer {
  id: string
  noiDung: string
}

interface Question {
  id: string
  noiDung: string
  thuTu: number
  answers: Answer[]
}

interface ExamSessionProps {
  examId?: string
  attemptId?: string
  examTitle: string
  thoiGianLam: number // minutes
  questions: Question[]
}

const LABEL = ['A', 'B', 'C', 'D', 'E', 'F']

export default function ExamSession({ examId, attemptId: initialAttemptId, examTitle, thoiGianLam, questions }: ExamSessionProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId ?? null)
  const [loadingAttempt, setLoadingAttempt] = useState(!initialAttemptId)
  const [attemptError, setAttemptError] = useState<string | null>(null)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // questionId -> answerId
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [remaining, setRemaining] = useState(thoiGianLam * 60)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)
  const { toast } = useToast()

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)

  const currentQ = questions[currentIdx]
  const totalQ = questions?.length || 0

  useEffect(() => {
    if (attemptId || !examId) return

    async function initAttempt() {
      try {
        const token = await getToken()
        const res = await fetch('/api/luot-lam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ exam_id: examId }),
        })
        let data
        try {
          data = await res.json()
        } catch {
          const text = await res.text()
          throw new Error(`Máy chủ trả về lỗi (HTTP ${res.status}) không đúng định dạng: ${text.slice(0, 80)}...`)
        }
        if (res.ok && data.data?.attempt_id) {
          setAttemptId(data.data.attempt_id)
          setLoadingAttempt(false)
        } else {
          setAttemptError(data.error?.message || data.message || 'Không thể tạo lượt làm bài')
          setLoadingAttempt(false)
        }
      } catch (err) {
        setAttemptError(`Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối máy chủ'}`)
        setLoadingAttempt(false)
      }
    }
    initAttempt()
  }, [examId, attemptId])

  const confirmSubmit = useCallback(async () => {
    if (submittedRef.current || submitting || !attemptId) return
    submittedRef.current = true
    setShowSubmitModal(false)
    setSubmitting(true)

    const MAX_RETRIES = 5;
    let attempt = 0;

    const cauTraLoi = questions.map((q) => ({
      questionId: q.id,
      noiDung: answers[q.id] ?? null,
    }))
    const urlToFetch = `/api/luot-lam/${attemptId}/nop`

    while (attempt <= MAX_RETRIES) {
      try {
        const token = await getToken()
        const res = await fetch(urlToFetch, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ cauTraLoi }),
        })

        if (res.ok) {
          localStorage.setItem(`flagged_${attemptId}`, JSON.stringify(Array.from(flagged)))
          router.push(`/ket-qua/${attemptId}`)
          return; // Success
        } else {
          const text = await res.text()
          console.error(`FETCH FAILED FOR URL: ${urlToFetch} WITH STATUS: ${res.status}`)
          console.error('SERVER RESPONDED WITH TEXT:', text)
          throw new Error('Server returned non-200 status')
        }
      } catch (err) {
        attempt++
        if (attempt <= MAX_RETRIES) {
          toast(`Không thể nộp bài — đang thử lại... (${attempt}/${MAX_RETRIES})`, 'loading')
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          toast('Lỗi khi nộp bài — vui lòng kiểm tra kết nối', 'error')
          submittedRef.current = false
          setSubmitting(false)
        }
      }
    }
  }, [answers, attemptId, getToken, questions, router, submitting, toast, flagged])

  const handlePressSubmit = () => {
    setShowSubmitModal(true)
  }

  // Timer — ref để tránh stale closure khi gọi confirmSubmit từ bên trong setRemaining
  const confirmSubmitRef = useRef(confirmSubmit)
  useEffect(() => {
    confirmSubmitRef.current = confirmSubmit
  })

  useEffect(() => {
    if (loadingAttempt || !attemptId) return
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval)
          toast('Hết thời gian — Tự động nộp bài', 'error')
          setShowTimeoutModal(true)
          confirmSubmitRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [loadingAttempt, attemptId])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const isWarning = remaining < 60

  const handleSelect = (answerId: string) => {
    if (submittedRef.current) return
    setAnswers((prev) => ({ ...prev, [currentQ.id]: answerId }))
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentIdx)) next.delete(currentIdx)
      else next.add(currentIdx)
      return next
    })
  }

  // Status của từng câu
  const getStatus = (idx: number): 'answered' | 'current' | 'flagged' | 'unanswered' => {
    const q = questions[idx]
    if (flagged.has(idx)) return 'flagged'
    if (idx === currentIdx) return 'current'
    if (answers[q.id]) return 'answered'
    return 'unanswered'
  }

  const statusStyle = (idx: number) => {
    const s = getStatus(idx)
    if (s === 'answered') return 'bg-green-100 text-green-800 border-green-300 font-semibold'
    if (s === 'current') return 'bg-[#CB30E0] text-white border-[#CB30E0] font-semibold'
    if (s === 'flagged') return 'bg-orange-50 text-orange-600 border-orange-200 font-semibold'
    return 'bg-white text-gray-800 border-gray-200 font-medium'
  }

  if (loadingAttempt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#CB30E0] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-500">Đang chuẩn bị đề thi cho bạn...</p>
      </div>
    )
  }

  if (attemptError || !attemptId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-red-100">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-sm text-gray-600 mb-6">{attemptError || 'Không thể tải đề thi.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#CB30E0] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-primary">Đề Thi</h1>
          <p className="text-sm font-medium text-gray-700">{examTitle}</p>
        </div>

        {/* Main layout */}
        <div className="flex gap-5">
          {/* LEFT — Question card */}
          <div className="flex-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {/* Question header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-bold uppercase text-gray-500">
                    Câu {currentIdx + 1}
                  </span>
                  <span className="text-[15px] font-semibold text-primary">
                    0.5 Điểm
                  </span>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`transition-colors ${flagged.has(currentIdx) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                  title="Đánh dấu câu hỏi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={flagged.has(currentIdx) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </button>
              </div>

              {/* Question text */}
              <p className="mb-5 text-[15px] font-medium text-gray-800 leading-relaxed">
                {currentQ.noiDung}
              </p>

              {/* Answers */}
              <div className="flex flex-col gap-2.5">
                {currentQ.answers.map((answer, i) => {
                  const isSelected = answers[currentQ.id] === answer.id
                  return (
                    <button
                      key={answer.id}
                      onClick={() => handleSelect(answer.id)}
                      className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-all shadow-sm ${
                        isSelected
                          ? 'border-green-400 bg-[#dcfce7]'
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-[#55BE24] text-white' : 'border border-gray-200 bg-white text-gray-700'
                      }`}>
                        {LABEL[i]}
                      </span>
                      <span className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                        {answer.noiDung}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Bottom nav */}
              <div className="mt-5 flex items-center justify-between">
                <div />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm disabled:opacity-30 hover:border-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
                    disabled={currentIdx === totalQ - 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm disabled:opacity-30 hover:border-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Question map + timer */}
          <div className="w-72 shrink-0">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              {/* Header */}
              <div className="mb-1 h-1 w-1/3 rounded-full bg-primary" />
              <div className="mb-4 mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Câu {currentIdx + 1}/ {totalQ}
                </span>
                <div className={`flex h-8 items-center gap-2 rounded-lg border px-3 ${isWarning ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill={isWarning ? '#EF4444' : '#b3b3b3'} />
                    <polyline points="12 6 12 12 15 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`text-[14px] font-medium tracking-wide ${isWarning ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                    {mm}:{ss}
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-1.5 mb-5">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex h-9 w-full items-center justify-center rounded-lg border text-xs transition-all ${statusStyle(idx)}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-[13px] font-medium text-gray-700">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-lg bg-[#dcfce7] border border-green-300" />
                  Đã trả lời
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-lg bg-[#CB30E0]" />
                  Đang làm
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-lg bg-orange-50 border border-orange-200" />
                  Đánh dấu
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-lg bg-white border border-gray-200" />
                  Chưa làm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handlePressSubmit}
            disabled={submitting}
            className="rounded-xl border border-[#B3B3B3] bg-white px-8 py-2.5 text-sm font-semibold text-[#252641] transition-all hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      {/* MODALS */}
      {(() => {
        const answeredCount = Object.keys(answers).length
        const unansweredCount = totalQ - answeredCount
        const isComplete = unansweredCount === 0

        return (
          <Modal 
            isOpen={showSubmitModal} 
            onClose={() => setShowSubmitModal(false)}
            title={isComplete ? "Xác nhận nộp bài" : "Chưa hoàn thành"}
            type={isComplete ? 'default' : 'danger'}
            footer={
              <>
                <button onClick={() => setShowSubmitModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                  Quay lại làm bài
                </button>
                <button 
                  onClick={confirmSubmit} 
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all ${
                    isComplete ? 'bg-[#C930E0] hover:opacity-90' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isComplete ? 'Nộp bài' : 'Vẫn nộp bài'}
                </button>
              </>
            }
          >
            {isComplete ? (
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <p className="mb-2 text-lg font-bold text-gray-900">{answeredCount} / {totalQ} câu</p>
                <p className="text-gray-500">Bạn đã hoàn thành tất cả các câu hỏi trong đề thi này. Bạn có chắc chắn muốn nộp bài ngay?</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <p className="text-[15px] text-gray-700 font-medium">Bạn còn <span className="text-red-500 font-bold">{unansweredCount}</span> câu chưa trả lời. Xác nhận nộp bài?</p>
              </div>
            )}
          </Modal>
        )
      })()}

      <Modal 
        isOpen={showTimeoutModal} 
        onClose={() => setShowTimeoutModal(false)}
        title="Hết thời gian"
        type="danger"
        footer={
          <button onClick={() => setShowTimeoutModal(false)} className="w-full rounded-xl bg-[#C930E0] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90">
            Xem kết quả
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="mb-2 text-lg font-bold text-gray-900">Thời gian làm bài đã kết thúc</p>
          <p className="text-gray-500">Hệ thống đã tự động lưu và nộp bài thi của bạn.</p>
        </div>
      </Modal>

    </div>
  )
}
