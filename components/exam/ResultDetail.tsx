import Link from 'next/link'

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
}

export default function ResultDetail({ diemSo, chiTiet, examTitle, videoId }: ResultDetailProps) {
  const correctCount = chiTiet.filter((c) => c.laDung).length
  const isPassed = diemSo >= 50

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
          {isPassed ? '🎉 Đạt' : '❌ Chưa đạt'}
        </p>
      </div>

      {/* Video review */}
      {videoId && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">📹 Video giải đề</h3>
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
              <p className="mb-2 font-medium text-gray-900">
                <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${item.laDung ? 'bg-[#55BE24]' : 'bg-[#F51A1A]'}`}>
                  {idx + 1}
                </span>
                {item.noiDung}
              </p>
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
