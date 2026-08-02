'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import LessonForm, { type LessonFormHandle } from '@/components/admin/LessonForm'
import PreviewModal from '@/components/admin/PreviewModal'

interface LessonFormPageProps {
  lessonId?: string
  lessonSlug?: string
}

export default function LessonFormPage({ lessonId, lessonSlug }: LessonFormPageProps) {
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
              Xóa bài học
            </button>
          )}

          {/* Preview */}
          <PreviewModal
            url={lessonSlug ? `/bai-hoc/${lessonSlug}` : '/bai-hoc'}
            title="Preview bài học"
          />

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
