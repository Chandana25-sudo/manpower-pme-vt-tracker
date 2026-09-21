import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { DataTable } from '@/components/DataTable'
import { ExportButton } from '@/components/ExportButton'
import { listPendingVt } from '@/firebase/manpower'
import { exportPendingVtToExcel } from '@/utils/exportUtils'
import { formatDisplayDate, calculateAge } from '@/utils/dateUtils'
import type { ManpowerRecord } from '@/types/manpower'

export function PendingVtPage() {
  const [records, setRecords] = useState<ManpowerRecord[] | null>(null)

  useEffect(() => {
    void listPendingVt().then(setRecords)
  }, [])

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">VT pending</h1>
        {records && records.length > 0 && (
          <ExportButton onExport={() => exportPendingVtToExcel(records)} label="Export list" />
        )}
      </div>

      {!records ? (
        <p className="text-ink-secondary">Loading…</p>
      ) : (
        <DataTable
          rows={records}
          rowKey={(r) => r.uan}
          emptyMessage="No pending VTs 🎉"
          columns={[
            { header: 'UMAN', render: (r) => r.uan },
            { header: 'Name', render: (r) => r.name },
            { header: 'Age', render: (r) => calculateAge(r.dob) },
            { header: 'Due date', render: (r) => formatDisplayDate(r.nextVtDueDate) },
          ]}
        />
      )}
    </Layout>
  )
}
