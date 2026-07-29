import Link from 'next/link'
import LessonForm from '@/components/admin/LessonForm'

export default function TaoMoiBaiHocPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[23px] font-extrabold tracking-wide text-primary">
          <Link href="/admin/bai-hoc" className="uppercase hover:underline">
            QUẢN LÝ BÀI HỌC
          </Link>
          <span className="text-primary">»</span>
          <span>Tạo mới</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            form="lesson-form"
            type="button"
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            Xoá bài học
          </button>
          <button
            form="lesson-form"
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
          <button
            form="lesson-form"
            name="action"
            value="draft"
            type="submit"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Lưu bản nháp
          </button>
          <button
            form="lesson-form"
            name="action"
            value="publish"
            type="submit"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#CB30E0' }}
          >
            Đăng bài
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <LessonForm />
      </div>
    </div>
  )
}
