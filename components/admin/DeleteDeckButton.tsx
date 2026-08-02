'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

interface DeleteDeckButtonProps {
  deckId: string
  tieuDe: string
}

export default function DeleteDeckButton({ deckId, tieuDe }: DeleteDeckButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa bộ flashcard "${tieuDe}"?\nTất cả thẻ bên trong cũng sẽ bị xóa. Hành động này không thể hoàn tác.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/flashcard/bo-the/${deckId}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Đã xóa bộ flashcard thành công', 'success')
        router.push('/admin/flashcard')
        router.refresh()
      } else {
        toast('Không thể xóa bộ flashcard', 'error')
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
      className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {deleting ? (
        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : null}
      Xóa bộ thẻ
    </button>
  )
}
