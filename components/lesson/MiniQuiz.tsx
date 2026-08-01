'use client'

import { useState } from 'react'
import type { MiniQuizContent } from '@/types'

export default function MiniQuiz({ data }: { data: MiniQuizContent }) {
  // Normalize data for legacy support
  const rawQuestions = data.questions || [{
    cauHoi: data.cauHoi || (data as any).cau_hoi || '',
    luaChon: data.luaChon || (data as any).lua_chon || [],
    dapAnDung: data.dapAnDung || (data as any).dap_an_dung || 'A',
  }]

  const questions = rawQuestions.map((q: any) => ({
    cauHoi: q.cauHoi || q.cau_hoi || '',
    luaChon: (q.luaChon || q.lua_chon || []).map((c: any) => ({
      kyHieu: c.kyHieu || c.ky_hieu || '',
      noiDung: c.noiDung || c.noi_dung || '',
    })),
    dapAnDung: q.dapAnDung || q.dap_an_dung || 'A',
  }))

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | null>>({})
  const [submitted, setSubmitted] = useState(false)

  // Calculate score if submitted
  const correctCount = questions.reduce((count, q, i) => {
    return count + (selectedAnswers[i] === q.dapAnDung ? 1 : 0)
  }, 0)

  return (
    <div className="rounded-r-xl border-l-4 border-[#CB30E0] bg-white p-6 shadow-sm border-y border-r border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-[#CB30E0] uppercase tracking-wider">Mini Quiz</span>
        {submitted && (
          <span className="text-sm font-bold text-primary">
            Đúng {correctCount}/{questions.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {questions.map((q, qIndex) => {
          const selected = selectedAnswers[qIndex]
          const isCorrect = selected === q.dapAnDung

          return (
            <div key={qIndex} className="flex flex-col">
              <p className="mb-4 font-semibold text-gray-900">
                {questions.length > 1 && <span className="mr-2 text-primary">Câu {qIndex + 1}:</span>}
                {q.cauHoi}
              </p>

              <div className="flex flex-col gap-2">
                {q.luaChon?.map((choice: any) => {
                  let className = 'flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer '
                  if (!submitted) {
                    className += selected === choice.kyHieu
                      ? 'border-primary bg-white text-primary shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary hover:shadow-sm'
                  } else {
                    if (choice.kyHieu === q.dapAnDung) {
                      className += 'border-success bg-green-50 text-success'
                    } else if (choice.kyHieu === selected) {
                      className += 'border-danger bg-red-50 text-danger'
                    } else {
                      className += 'border-gray-200 bg-white text-gray-400 opacity-60'
                    }
                  }

                  return (
                    <button
                      key={choice.kyHieu}
                      onClick={() => {
                        if (!submitted) {
                          setSelectedAnswers(prev => ({ ...prev, [qIndex]: choice.kyHieu }))
                        }
                      }}
                      className={className}
                      disabled={submitted}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${selected === choice.kyHieu && !submitted ? 'border-primary bg-primary text-white' : ''}`}>
                        {choice.kyHieu}
                      </span>
                      {choice.noiDung}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        {!submitted ? (
          <button
            onClick={() => {
              // Ensure all questions are answered
              if (Object.keys(selectedAnswers).length === questions.length) {
                setSubmitted(true)
              } else {
                alert('Vui lòng chọn đáp án cho tất cả câu hỏi!')
              }
            }}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            Kiểm tra đáp án
          </button>
        ) : (
          <button
            onClick={() => {
              setSubmitted(false)
              setSelectedAnswers({})
            }}
            className="rounded-lg border-2 border-primary bg-transparent px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Làm lại
          </button>
        )}
      </div>
    </div>
  )
}
