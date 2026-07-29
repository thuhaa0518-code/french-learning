import Link from 'next/link'

interface AttemptItem {
  id: string
  examTitle: string
  diemSo: number
  thoiGianNop: Date | null
}

export default function ExamHistory({ attempts }: { attempts: AttemptItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Lịch sử thi</h2>

      {attempts.length === 0 ? (
        <p className="text-sm text-gray-400">Bạn chưa làm bài thi nào.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {attempts.map((attempt) => {
            const isPassed = attempt.diemSo >= 50
            return (
              <div key={attempt.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{attempt.examTitle}</p>
                  {attempt.thoiGianNop && (
                    <p className="text-xs text-gray-400">
                      {new Date(attempt.thoiGianNop).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <span
                    className="text-sm font-bold"
                    style={{ color: isPassed ? '#55BE24' : '#F51A1A' }}
                  >
                    {attempt.diemSo} điểm
                  </span>
                  <Link
                    href={`/ket-qua/${attempt.id}`}
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    Xem
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
