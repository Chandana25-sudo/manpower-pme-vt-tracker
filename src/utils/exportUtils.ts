import * as XLSX from 'xlsx'
import type { CompletionRecord, ManpowerRecord } from '@/types/manpower'
import { formatDisplayDate, calculateAge } from './dateUtils'

function toRow(record: ManpowerRecord) {
  return {
    'UMAN Number': record.uan,
    Name: record.name,
    'Date of Birth': formatDisplayDate(record.dob),
    Age: calculateAge(record.dob),
    Status: record.status,
    'Last PME Date': formatDisplayDate(record.lastPmeDate),
    'Next PME Due': formatDisplayDate(record.nextPmeDueDate),
    'Last VT Date': formatDisplayDate(record.lastVtDate),
    'Next VT Due': formatDisplayDate(record.nextVtDueDate),
    'Deactivation Reason': record.deactivationReason ?? '—',
    'Deactivated Date': formatDisplayDate(record.deactivatedAt),
  }
}

function toCompletionRow(record: CompletionRecord) {
  return {
    'UMAN Number': record.uan,
    Name: record.name,
    Type: record.type,
    'Completed Date': formatDisplayDate(record.completedDate),
    'Next Due Date': formatDisplayDate(record.nextDueDate),
  }
}

function downloadWorkbook(rows: Record<string, unknown>[], sheetName: string, fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}

export function exportManpowerToExcel(records: ManpowerRecord[], fileName = 'manpower-directory.xlsx') {
  downloadWorkbook(records.map(toRow), 'Manpower', fileName)
}

export function exportPendingPmeToExcel(records: ManpowerRecord[], fileName = 'pme-pending.xlsx') {
  downloadWorkbook(records.map(toRow), 'PME Pending', fileName)
}

export function exportPendingVtToExcel(records: ManpowerRecord[], fileName = 'vt-pending.xlsx') {
  downloadWorkbook(records.map(toRow), 'VT Pending', fileName)
}

export function exportDeactivatedToExcel(records: ManpowerRecord[], fileName = 'deactivated.xlsx') {
  downloadWorkbook(records.map(toRow), 'Deactivated', fileName)
}

export function exportCompletionsToExcel(records: CompletionRecord[], fileName = 'completions.xlsx') {
  downloadWorkbook(records.map(toCompletionRow), 'Completions', fileName)
}
