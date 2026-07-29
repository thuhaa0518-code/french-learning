'use client'

import { useEffect, useRef, useCallback } from 'react'

interface LessonProgressBarProps {
  lessonId: string
}

export default function LessonProgressBar({ lessonId }: LessonProgressBarProps) {
  const lastSent = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendProgress = useCallback(
    async (pct: number) => {
      try {
        await fetch('/api/tien-do', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: lessonId, phan_tram: pct }),
        })
        lastSent.current = pct
      } catch {
        // Silent fail — tiến độ không ảnh hưởng UX
      }
    },
    [lessonId],
  )

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      const clamped = Math.min(100, Math.max(0, pct))

      if (Math.abs(clamped - lastSent.current) < 5) return

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => sendProgress(clamped), 2000)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [sendProgress])

  return null // Invisible — logic only
}
