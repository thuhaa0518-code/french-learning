'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

interface DeleteExamButtonProps {
  examId: string
  tieuDe: string
}

export default function DeleteExamButton({ examId, tieuDe }: DeleteExamButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa đề thi "${tieuDe}"?\nHành động này không thể hoàn tác.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/de-thi/${examId}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Đã xóa đề thi thành công', 'success')
        router.push('/admin/de-thi')
        router.refresh()
      } else {
        toast('Không thể xóa đề thi', 'error')
      }
    } catch {
      toast('Lỗi kết nối server', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {deleting ? (
        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : null}
      Xóa đề thi
    </button>
  )
}
