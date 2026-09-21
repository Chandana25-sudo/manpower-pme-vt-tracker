import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { StatCard } from '@/components/StatCard'
import { DataTable } from '@/components/DataTable'
import { ExportButton } from '@/components/ExportButton'
import { listActiveManpower, getCompletionsForType } from '@/firebase/manpower'
import { exportCompletionsToExcel, exportManpowerToExcel } from '@/utils/exportUtils'
import {
  calculateAge,
  countByMonth,
  formatDisplayDate,
  isSameMonthAndYear,
  isSameYear,
  MONTH_LABELS,
  isInMonth,
} from '@/utils/dateUtils'
import type { CompletionRecord, ComplianceType, ManpowerRecord } from '@/types/manpower'

type SelectionKind = 'active' | 'pmeMonth' | 'pmeYear' | 'vtMonth' | 'vtYear' | 'monthCell'

interface Selection {
  kind: SelectionKind
  title: string
  type?: ComplianceType
  month?: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState<ManpowerRecord[] | null>(null)
  const [pmeCompletions, setPmeCompletions] = useState<CompletionRecord[] | null>(null)
  const [vtCompletions, setVtCompletions] = useState<CompletionRecord[] | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)

  useEffect(() => {
    void Promise.all([listActiveManpower(), getCompletionsForType('PME'), getCompletionsForType('VT')]).then(
      ([activeList, pme, vt]) => {
        setActive(activeList)
        setPmeCompletions(pme)
        setVtCompletions(vt)
        const today = new Date().toISOString().slice(0, 10)
        setPendingCount(
          activeList.filter((r) => !r.nextPmeDueDate || r.nextPmeDueDate <= today).length,
        )
      },
    )
  }, [])

  const now = useMemo(() => new Date(), [])
  const year = now.getFullYear()

  const monthlyRows = useMemo(() => {
    if (!pmeCompletions || !vtCompletions) return null
    const pmeCounts = countByMonth(pmeCompletions.map((c) => c.completedDate), year)
    const vtCounts = countByMonth(vtCompletions.map((c) => c.completedDate), year)
    return MONTH_LABELS.map((label, month) => ({
      month,
      label,
      pmeCount: pmeCounts[month] ?? 0,
      vtCount: vtCounts[month] ?? 0,
    }))
  }, [pmeCompletions, vtCompletions, year])

  if (!active || !pmeCompletions || !vtCompletions || pendingCount === null || !monthlyRows) {
    return (
      <Layout>
        <p className="text-ink-secondary">Loading stats…</p>
      </Layout>
    )
  }

  const pmeThisMonth = pmeCompletions.filter((c) => isSameMonthAndYear(c.completedDate, now))
  const pmeThisYear = pmeCompletions.filter((c) => isSameYear(c.completedDate, now))
  const vtThisMonth = vtCompletions.filter((c) => isSameMonthAndYear(c.completedDate, now))
  const vtThisYear = vtCompletions.filter((c) => isSameYear(c.completedDate, now))

  function selectionRows(): CompletionRecord[] {
    if (!selection) return []
    switch (selection.kind) {
      case 'pmeMonth':
        return pmeThisMonth
      case 'pmeYear':
        return pmeThisYear
      case 'vtMonth':
        return vtThisMonth
      case 'vtYear':
        return vtThisYear
      case 'monthCell': {
        const source = (selection.type === 'PME' ? pmeCompletions : vtCompletions) ?? []
        return source.filter((c) => isInMonth(c.completedDate, year, selection.month ?? 0))
      }
      default:
        return []
    }
  }

  return (
    <Layout>
      <h1 className="mb-4 text-lg font-semibold text-ink">Overview</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Active manpower"
          value={active.length}
          tone="neutral"
          selected={selection?.kind === 'active'}
          onClick={() => setSelection({ kind: 'active', title: 'Active manpower' })}
        />
        <StatCard
          label="PME pending"
          value={pendingCount}
          tone="critical"
          onClick={() => navigate('/pending')}
        />
        <StatCard
          label="PMEs done this month"
          value={pmeThisMonth.length}
          tone="pme"
          selected={selection?.kind === 'pmeMonth'}
          onClick={() => setSelection({ kind: 'pmeMonth', title: 'PMEs completed this month' })}
        />
        <StatCard
          label="PMEs done this year"
          value={pmeThisYear.length}
          tone="pme"
          selected={selection?.kind === 'pmeYear'}
          onClick={() => setSelection({ kind: 'pmeYear', title: 'PMEs completed this year' })}
        />
        <StatCard
          label="VTs done this month"
          value={vtThisMonth.length}
          tone="vt"
          selected={selection?.kind === 'vtMonth'}
          onClick={() => setSelection({ kind: 'vtMonth', title: 'VTs completed this month' })}
        />
        <StatCard
          label="VTs done this year"
          value={vtThisYear.length}
          tone="vt"
          selected={selection?.kind === 'vtYear'}
          onClick={() => setSelection({ kind: 'vtYear', title: 'VTs completed this year' })}
        />
      </div>

      {selection && selection.kind === 'active' && (
        <DrillDown
          title={selection.title}
          onClose={() => setSelection(null)}
          onExport={() => exportManpowerToExcel(active, 'active-manpower.xlsx')}
        >
          <DataTable
            rows={active}
            rowKey={(r) => r.uan}
            columns={[
              { header: 'UMAN', render: (r) => r.uan },
              { header: 'Name', render: (r) => r.name },
              { header: 'Age', render: (r) => calculateAge(r.dob) },
            ]}
          />
        </DrillDown>
      )}

      {selection && selection.kind !== 'active' && (
        <DrillDown
          title={selection.title}
          onClose={() => setSelection(null)}
          onExport={() => exportCompletionsToExcel(selectionRows(), 'completions.xlsx')}
        >
          <DataTable
            rows={selectionRows()}
            rowKey={(c, i) => `${c.uan}-${c.completedDate}-${i}`}
            emptyMessage="No completions in this period"
            columns={[
              { header: 'UMAN', render: (c) => c.uan },
              { header: 'Name', render: (c) => c.name },
              { header: 'Completed', render: (c) => formatDisplayDate(c.completedDate) },
              { header: 'Next due', render: (c) => formatDisplayDate(c.nextDueDate) },
            ]}
          />
        </DrillDown>
      )}

      <div className="mt-8">
        <h2 className="mb-2 font-medium text-ink">Monthly completions — {year}</h2>
        <div className="overflow-x-auto rounded-lg border border-hairline bg-surface shadow-tile">
          <table className="min-w-full divide-y divide-hairline text-sm">
            <thead className="bg-black/[0.02]">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-ink-secondary">Month</th>
                <th className="px-4 py-2 text-left font-medium text-ink-secondary">PME completed</th>
                <th className="px-4 py-2 text-left font-medium text-ink-secondary">VT completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {monthlyRows.map((row) => (
                <tr key={row.month} className="hover:bg-black/[0.015]">
                  <td className="px-4 py-2 text-ink">{row.label}</td>
                  <td className="px-4 py-2">
                    <MonthCell
                      count={row.pmeCount}
                      onClick={() =>
                        setSelection({
                          kind: 'monthCell',
                          type: 'PME',
                          month: row.month,
                          title: `PMEs completed — ${row.label} ${year}`,
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <MonthCell
                      count={row.vtCount}
                      onClick={() =>
                        setSelection({
                          kind: 'monthCell',
                          type: 'VT',
                          month: row.month,
                          title: `VTs completed — ${row.label} ${year}`,
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

function MonthCell({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) {
    return <span className="text-ink-muted">0</span>
  }
  return (
    <button onClick={onClick} className="font-medium text-brand-700 underline-offset-2 hover:underline">
      {count}
    </button>
  )
}

function DrillDown({
  title,
  onClose,
  onExport,
  children,
}: {
  title: string
  onClose: () => void
  onExport: () => void
  children: ReactNode
}) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium text-ink">{title}</h2>
        <div className="flex gap-2">
          <ExportButton onExport={onExport} />
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-black/5">
            Close ✕
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
