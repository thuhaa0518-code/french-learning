'use client'

import { useState, useEffect, useRef } from 'react'

interface CountdownTimerProps {
  thoiGianLam: number  // minutes
  onExpire: () => void
}

export default function CountdownTimer({ thoiGianLam, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(thoiGianLam * 60)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }

    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer)
          onExpireRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining])

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0')
  const seconds = (remaining % 60).toString().padStart(2, '0')
  const isWarning = remaining < 60

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold tabular-nums transition-colors ${
        isWarning ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isWarning && <span className="animate-pulse">⚠️</span>}
      {minutes}:{seconds}
    </div>
  )
}
