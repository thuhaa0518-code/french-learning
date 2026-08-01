'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import Link from 'next/link'

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { toast } = useToast()

  useEffect(() => {
    toast('Không thể tải bài học — kiểm tra kết nối', 'error')
  }, [error, toast])

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-20 px-4">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">Không thể tải bài học</h2>
      <p className="mb-6 text-gray-500 text-center">
        Vui lòng kiểm tra lại kết nối mạng của bạn và thử lại.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          Thử lại
        </button>
        <Link
          href="/bai-hoc"
          className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Về danh sách
        </Link>
      </div>
    </div>
  )
}
