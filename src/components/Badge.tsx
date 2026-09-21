import type { ReactNode } from 'react'

type Tone = 'good' | 'warning' | 'critical' | 'neutral'

const dotClasses: Record<Tone, string> = {
  good: 'bg-status-good',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  neutral: 'bg-ink-muted',
}

const surfaceClasses: Record<Tone, string> = {
  good: 'bg-status-good/10 border-status-good/20',
  warning: 'bg-status-warning/15 border-status-warning/30',
  critical: 'bg-status-critical/10 border-status-critical/20',
  neutral: 'bg-black/[0.03] border-hairline',
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-ink-secondary ${surfaceClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {children}
    </span>
  )
}
