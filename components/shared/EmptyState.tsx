import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: string
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon = '📚',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
