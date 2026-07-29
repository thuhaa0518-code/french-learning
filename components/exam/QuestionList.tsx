'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

interface QuestionListProps {
  attemptId: string
  questions: Question[]
}

export default function QuestionList({ attemptId, questions }: QuestionListProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (questionId: string, answerId: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)

    try {
      const cauTraLoi = questions.map((q) => ({
        questionId: q.id,
        noiDung: answers[q.id] ?? null,
      }))

      const res = await fetch(`/api/luot-lam/${attemptId}/nop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauTraLoi }),
      })

      if (res.ok) {
        setSubmitted(true)
        router.push(`/ket-qua/${attemptId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }, [attemptId, answers, questions, router, submitting, submitted])

  const answeredCount = Object.keys(answers).length

  return (
    <div className="flex flex-col gap-8">
      {questions.map((question, idx) => (
        <div key={question.id} className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="mb-4 font-semibold text-gray-900">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {idx + 1}
            </span>
            {question.noiDung}
          </p>
          <div className="flex flex-col gap-2">
            {question.answers.map((answer) => {
              const isSelected = answers[question.id] === answer.id
              return (
                <button
                  key={answer.id}
                  onClick={() => handleSelect(question.id, answer.id)}
                  disabled={submitted}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? 'border-primary bg-purple-50 text-primary font-medium'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {answer.noiDung}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Đã trả lời <span className="font-semibold text-gray-900">{answeredCount}</span>/{questions.length} câu
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </div>
  )
}
