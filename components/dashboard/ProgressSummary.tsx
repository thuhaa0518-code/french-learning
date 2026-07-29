interface ProgressSummaryProps {
  completed: number
  inProgress: number
  notStarted: number
  total: number
}

export default function ProgressSummary({ completed, inProgress, notStarted, total }: ProgressSummaryProps) {
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Tiến độ bài học</h2>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-500">Tổng tiến độ</span>
          <span className="font-semibold text-gray-900">{completedPct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${completedPct}%`, backgroundColor: '#CB30E0' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F0FDE8' }}>
          <p className="text-2xl font-bold" style={{ color: '#55BE24' }}>{completed}</p>
          <p className="text-xs text-gray-600 mt-0.5">Hoàn thành</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#EBF5FF' }}>
          <p className="text-2xl font-bold" style={{ color: '#0088FF' }}>{inProgress}</p>
          <p className="text-xs text-gray-600 mt-0.5">Đang học</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F5F5F5' }}>
          <p className="text-2xl font-bold" style={{ color: '#5B5B5B' }}>{notStarted}</p>
          <p className="text-xs text-gray-600 mt-0.5">Chưa bắt đầu</p>
        </div>
      </div>
    </div>
  )
}
