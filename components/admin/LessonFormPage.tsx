'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import LessonForm, { type LessonFormHandle } from '@/components/admin/LessonForm'

interface LessonFormPageProps {
  lessonId?: string
}

export default function LessonFormPage({ lessonId }: LessonFormPageProps) {
  const formRef = useRef<LessonFormHandle>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (isPublish: boolean) => {
    if (!formRef.current) return
    setSaving(true)
    await formRef.current.submit(isPublish)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!formRef.current || !lessonId) return
    await formRef.current.handleDelete()
  }

  return (
    <div className="min-h-full p-6 font-exo">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/bai-hoc"
            className="font-bold text-[#CB30E0] uppercase tracking-wide hover:opacity-75 transition-opacity"
          >
            Quản lý bài học
          </Link>
          <span className="text-gray-400 font-bold">»</span>
          <span className="font-bold text-gray-700 uppercase tracking-wide">
            {lessonId ? 'Chỉnh sửa' : 'Tạo mới'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Xóa bài học — chỉ hiện khi edit */}
          {lessonId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="currentColor" className="w-[14px] h-[18px]">
                <path fillRule="evenodd" clipRule="evenodd" d="M5 1h4v1H5z M1 3h12v1H1z M2 5v12h10V5H2z M3 6h8v10H3V6z M5 8h1v6H5V8z M8 8h1v6H8V8z" />
              </svg>
              Xóa bài học
            </button>
          )}

          {/* Preview */}
          <Link
            href={lessonId ? `/bai-hoc` : '#'}
            target={lessonId ? '_blank' : undefined}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Link>

          {/* Lưu bản nháp */}
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Lưu bản nháp
          </button>

          {/* Đăng bài */}
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#CB30E0' }}
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 13l4 4L19 7" />
              </svg>
            )}
            Đăng bài
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      <LessonForm ref={formRef} lessonId={lessonId} />
    </div>
  )
}
