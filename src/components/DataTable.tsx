import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string
  emptyMessage?: string
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = 'No records found' }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-secondary">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-surface shadow-tile">
      <table className="min-w-full divide-y divide-hairline text-sm">
        <thead className="bg-black/[0.02]">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2 text-left font-medium text-ink-secondary">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="hover:bg-black/[0.015]">
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-2 text-ink">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
