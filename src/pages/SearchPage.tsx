import { useState, type FormEvent } from 'react'
import { Layout } from '@/components/Layout'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { DataTable } from '@/components/DataTable'
import { RecordComplianceModal } from '@/components/RecordComplianceModal'
import { DeleteFlowModal } from '@/components/DeleteFlowModal'
import {
  deactivateManpower,
  getComplianceHistory,
  getManpowerByUan,
  recordCompliance,
} from '@/firebase/manpower'
import { calculateAge, formatDisplayDate, isOverdue } from '@/utils/dateUtils'
import type { ComplianceEvent, ComplianceType, DeletionReason, ManpowerRecord } from '@/types/manpower'

export function SearchPage() {
  const [uanInput, setUanInput] = useState('')
  const [record, setRecord] = useState<ManpowerRecord | null>(null)
  const [pmeHistory, setPmeHistory] = useState<ComplianceEvent[]>([])
  const [vtHistory, setVtHistory] = useState<ComplianceEvent[]>([])
  const [notFound, setNotFound] = useState(false)
  const [activeModal, setActiveModal] = useState<ComplianceType | 'delete' | null>(null)

  async function loadRecord(uan: string) {
    const result = await getManpowerByUan(uan)
    setRecord(result)
    setNotFound(!result)
    if (result) {
      const [pme, vt] = await Promise.all([
        getComplianceHistory(uan, 'PME'),
        getComplianceHistory(uan, 'VT'),
      ])
      setPmeHistory(pme)
      setVtHistory(vt)
    } else {
      setPmeHistory([])
      setVtHistory([])
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    await loadRecord(uanInput.trim())
  }

  async function handleRecordCompliance(type: ComplianceType, completedDate: string, nextDueDate: string, notes?: string) {
    if (!record) return
    await recordCompliance({ uan: record.uan, type, completedDate, nextDueDate, notes })
    await loadRecord(record.uan)
  }

  async function handleDelete(reason: DeletionReason) {
    if (!record) return
    await deactivateManpower(record.uan, reason)
    await loadRecord(record.uan)
  }

  return (
    <Layout>
      <h1 className="mb-4 text-lg font-semibold text-ink">Search by UMAN</h1>
      <form onSubmit={handleSearch} className="mb-6 flex max-w-md gap-2">
        <FormField
          label="UMAN Number"
          value={uanInput}
          onChange={(e) => setUanInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="mt-6 h-fit">
          Search
        </Button>
      </form>

      {notFound && <p className="text-sm text-ink-secondary">No record found for that UMAN.</p>}

      {record && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-tile">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-ink">{record.name}</p>
                <p className="text-sm text-ink-secondary">UMAN: {record.uan}</p>
                <p className="text-sm text-ink-secondary">
                  DOB: {formatDisplayDate(record.dob)} (Age {calculateAge(record.dob)})
                </p>
              </div>
              <Badge tone={record.status === 'active' ? 'good' : 'neutral'}>{record.status}</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setActiveModal('PME')} disabled={record.status !== 'active'}>
                Update PME
              </Button>
              <Button onClick={() => setActiveModal('VT')} disabled={record.status !== 'active'}>
                Update VT
              </Button>
              {record.status === 'active' && (
                <Button variant="danger" onClick={() => setActiveModal('delete')}>
                  Delete
                </Button>
              )}
            </div>
          </div>

          <HistorySection
            title="PME history"
            events={pmeHistory}
            nextDueDate={record.nextPmeDueDate}
          />
          <HistorySection title="VT history" events={vtHistory} nextDueDate={record.nextVtDueDate} />
        </div>
      )}

      {record && (
        <>
          <RecordComplianceModal
            type="PME"
            isOpen={activeModal === 'PME'}
            onClose={() => setActiveModal(null)}
            onSubmit={(completed, due, notes) => handleRecordCompliance('PME', completed, due, notes)}
          />
          <RecordComplianceModal
            type="VT"
            isOpen={activeModal === 'VT'}
            onClose={() => setActiveModal(null)}
            onSubmit={(completed, due, notes) => handleRecordCompliance('VT', completed, due, notes)}
          />
          <DeleteFlowModal
            record={record}
            isOpen={activeModal === 'delete'}
            onClose={() => setActiveModal(null)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </Layout>
  )
}

function HistorySection({
  title,
  events,
  nextDueDate,
}: {
  title: string
  events: ComplianceEvent[]
  nextDueDate?: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium text-ink">{title}</h2>
        {nextDueDate && (
          <Badge tone={isOverdue(nextDueDate) ? 'critical' : 'good'}>
            Next due: {formatDisplayDate(nextDueDate)}
          </Badge>
        )}
      </div>
      <DataTable
        rows={events}
        rowKey={(e) => e.id}
        emptyMessage="No history yet"
        columns={[
          { header: 'Completed', render: (e) => formatDisplayDate(e.completedDate) },
          { header: 'Next due (at the time)', render: (e) => formatDisplayDate(e.nextDueDate) },
          { header: 'Notes', render: (e) => e.notes ?? '—' },
        ]}
      />
    </div>
  )
}
