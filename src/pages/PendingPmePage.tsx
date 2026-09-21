import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { DataTable } from '@/components/DataTable'
import { ExportButton } from '@/components/ExportButton'
import { listPendingPme } from '@/firebase/manpower'
import { exportPendingPmeToExcel } from '@/utils/exportUtils'
import { formatDisplayDate, calculateAge } from '@/utils/dateUtils'
import type { ManpowerRecord } from '@/types/manpower'

export function PendingPmePage() {
  const [records, setRecords] = useState<ManpowerRecord[] | null>(null)

  useEffect(() => {
    void listPendingPme().then(setRecords)
  }, [])

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">PME pending</h1>
        {records && records.length > 0 && (
          <ExportButton onExport={() => exportPendingPmeToExcel(records)} label="Export list" />
        )}
      </div>

      {!records ? (
        <p className="text-ink-secondary">Loading…</p>
      ) : (
        <DataTable
          rows={records}
          rowKey={(r) => r.uan}
          emptyMessage="No pending PMEs 🎉"
          columns={[
            { header: 'UMAN', render: (r) => r.uan },
            { header: 'Name', render: (r) => r.name },
            { header: 'Age', render: (r) => calculateAge(r.dob) },
            { header: 'Due date', render: (r) => formatDisplayDate(r.nextPmeDueDate) },
          ]}
        />
      )}
    </Layout>
  )
}
