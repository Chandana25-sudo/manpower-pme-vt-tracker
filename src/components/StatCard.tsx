type Tone = 'neutral' | 'pme' | 'vt' | 'critical'

const accentClasses: Record<Tone, string> = {
  neutral: 'bg-ink-muted',
  pme: 'bg-brand-500',
  vt: 'bg-teal-500',
  critical: 'bg-status-critical',
}

interface StatCardProps {
  label: string
  value: number | string
  tone?: Tone
  onClick?: () => void
  selected?: boolean
}

export function StatCard({ label, value, tone = 'neutral', onClick, selected = false }: StatCardProps) {
  const clickable = Boolean(onClick)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`group flex w-full items-stretch overflow-hidden rounded-lg border bg-surface text-left shadow-tile transition-all ${
        clickable ? 'cursor-pointer hover:shadow-tile-hover' : 'cursor-default'
      } ${selected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-hairline'}`}
    >
      <span className={`w-1.5 shrink-0 ${accentClasses[tone]}`} />
      <span className="flex flex-1 items-center justify-between px-4 py-3">
        <span>
          <span className="block text-xs font-medium text-ink-secondary">{label}</span>
          <span className="mt-0.5 block text-2xl font-semibold text-ink">{value}</span>
        </span>
        {clickable && (
          <span className="text-ink-muted transition-transform group-hover:translate-x-0.5">›</span>
        )}
      </span>
    </button>
  )
}
