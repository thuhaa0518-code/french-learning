'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useToast } from '@/components/ui/ToastProvider'

interface ChiTiet {
  questionId: string
  noiDung: string
  cauTraLoi: string | null
  dapAnDung: string
  laDung: boolean
}

interface ResultDetailProps {
  diemSo: number
  chiTiet: ChiTiet[]
  examTitle: string
  videoId?: string | null
  attemptId?: string
}

export default function ResultDetail({ diemSo, chiTiet, examTitle, videoId, attemptId }: ResultDetailProps) {
  const correctCount = chiTiet.filter((c) => c.laDung).length
  const isPassed = diemSo >= 50
  
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [isVideoAvailable, setIsVideoAvailable] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (videoId) {
      const img = new Image()
      img.onload = () => {
        // Mặc định ảnh lỗi của youtube là hình nhỏ (120x90).
        if (img.width === 120) {
          setIsVideoAvailable(false)
          toast('Video hiện không khả dụng', 'error')
        }
      }
      img.onerror = () => {
        setIsVideoAvailable(false)
        toast('Video hiện không khả dụng', 'error')
      }
      // mqdefault (320x180) is always generated even if maxres is not.
      img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
  }, [videoId, toast])

  useEffect(() => {
    if (attemptId) {
      const stored = localStorage.getItem(`flagged_${attemptId}`)
      if (stored) {
        try {
          const arr = JSON.parse(stored) as number[]
          setFlagged(new Set(arr))
        } catch {
          // ignore
        }
      }
    }
  }, [attemptId])

  return (
    <div className="flex flex-col gap-8">
      {/* Score summary */}
      <div className={`rounded-2xl p-8 text-center ${isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="text-5xl font-bold mb-2" style={{ color: isPassed ? '#55BE24' : '#F51A1A' }}>
          {diemSo}
        </div>
        <p className="text-gray-600 text-sm">điểm</p>
        <p className="mt-2 font-medium text-gray-900">
          {correctCount}/{chiTiet.length} câu đúng
        </p>
        <p className="mt-1 text-sm font-semibold" style={{ color: isPassed ? '#55BE24' : '#F51A1A' }}>
          {isPassed ? 'Đạt' : 'Chưa đạt'}
        </p>
      </div>

      {/* Video review */}
      {videoId && isVideoAvailable && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Video giải đề</h3>
          <div className="aspect-video overflow-hidden rounded-xl">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              allowFullScreen
              className="h-full w-full"
              title="Video giải đề"
            />
          </div>
        </div>
      )}

      {/* Question detail */}
      <div>
        <h3 className="mb-4 font-semibold text-gray-900">Chi tiết từng câu</h3>
        <div className="flex flex-col gap-4">
          {chiTiet.map((item, idx) => (
            <div
              key={item.questionId}
              className={`rounded-xl border-2 p-4 ${item.laDung ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <div className="flex items-start justify-between">
                <p className="mb-2 font-medium text-gray-900 flex-1 pr-4">
                  <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-white shrink-0 ${item.laDung ? 'bg-[#55BE24]' : 'bg-[#F51A1A]'}`}>
                    {idx + 1}
                  </span>
                  {item.noiDung}
                </p>
                {flagged.has(idx) && (
                  <div className="shrink-0 text-yellow-500 mt-0.5" title="Câu hỏi đã đánh dấu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="pl-7 text-sm space-y-1">
                {item.cauTraLoi ? (
                  <p className={item.laDung ? 'text-green-700' : 'text-red-700'}>
                    Bạn chọn: {item.cauTraLoi}
                  </p>
                ) : (
                  <p className="text-gray-400">Bỏ trống</p>
                )}
                {!item.laDung && (
                  <p className="text-green-700 font-medium">Đáp án đúng: {item.dapAnDung}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/de-thi"
        className="w-full rounded-xl bg-primary py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
      >
        Làm đề khác
      </Link>
    </div>
  )
}
