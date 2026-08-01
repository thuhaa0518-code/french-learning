import Link from 'next/link'
import FlashcardDeckForm from '@/components/admin/FlashcardDeckForm'

export default function TaoMoiFlashcardPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[23px] font-extrabold tracking-wide text-primary">
          <Link href="/admin/flashcard" className="uppercase hover:underline">QUẢN LÝ FLASHCARD</Link>
          <span className="text-primary">»</span>
          <span>Tạo mới</span>
        </div>
        <div className="flex items-center gap-2">
          <button form="deck-form" name="action" value="draft" type="submit" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Lưu bản nháp</button>
          <button form="deck-form" name="action" value="publish" type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#CB30E0' }}>Đăng bài</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <FlashcardDeckForm />
      </div>
    </div>
  )
}
