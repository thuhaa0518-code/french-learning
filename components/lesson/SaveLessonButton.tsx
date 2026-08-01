'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

interface Props {
  lessonId: string
  initialSaved: boolean
}

export default function SaveLessonButton({ lessonId, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleToggle = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/lesson/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })

      if (res.status === 401) {
        toast('Vui lòng đăng nhập để lưu bài học', 'error')
        return
      }

      if (!res.ok) {
        throw new Error('Lỗi khi lưu bài học')
      }

      const data = await res.json()
      setSaved(data.data.saved)
      
      if (data.data.saved) {
        toast('Đã lưu bài học thành công', 'success')
      } else {
        toast('Đã bỏ lưu bài học', 'info')
      }
      
      router.refresh()
    } catch (error) {
      toast('Có lỗi xảy ra', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`mt-6 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors ${
        saved
          ? 'border-[#CB30E0] bg-[#CB30E0] text-white hover:opacity-90'
          : 'border-gray-200 bg-white text-gray-900 hover:border-[#CB30E0] hover:text-[#CB30E0]'
      } disabled:opacity-50`}
    >
      {saved ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Đã lưu
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Lưu bài học
        </>
      )}
    </button>
  )
}
