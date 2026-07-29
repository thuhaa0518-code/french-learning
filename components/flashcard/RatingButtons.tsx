'use client'

interface RatingButtonsProps {
  onRate: (rating: 'De' | 'Kho' | 'Lam_lai') => void
  disabled?: boolean
}

const BUTTONS = [
  { rating: 'De' as const, label: 'Dễ', emoji: '😊', color: 'bg-[#55BE24] hover:bg-[#49a81f]' },
  { rating: 'Kho' as const, label: 'Khó', emoji: '😓', color: 'bg-[#F51A1A] hover:bg-[#d91717]' },
  { rating: 'Lam_lai' as const, label: 'Làm lại', emoji: '🔄', color: 'bg-[#CB30E0] hover:bg-[#b229c8]' },
]

export default function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {BUTTONS.map(({ rating, label, emoji, color }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`flex flex-col items-center gap-1 rounded-xl px-6 py-3 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${color}`}
        >
          <span className="text-xl">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
