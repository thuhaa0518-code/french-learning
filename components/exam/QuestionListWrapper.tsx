'use client'

import { useCallback, useRef } from 'react'
import CountdownTimer from './CountdownTimer'
import QuestionList from './QuestionList'

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

interface Props {
  attemptId: string
  thoiGianLam: number
  questions: Question[]
}

export default function QuestionListWrapper({ attemptId, thoiGianLam, questions }: Props) {
  const questionListRef = useRef<{ submit: () => void }>(null)

  const handleExpire = useCallback(() => {
    questionListRef.current?.submit()
  }, [])

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">Thời gian còn lại:</p>
        <CountdownTimer thoiGianLam={thoiGianLam} onExpire={handleExpire} />
      </div>
      <QuestionList attemptId={attemptId} questions={questions} />
    </div>
  )
}
