import { addYears, differenceInYears, format, isAfter, isBefore, parseISO } from 'date-fns'
import type { ComplianceType } from '@/types/manpower'

export const VALIDITY_YEARS: Record<ComplianceType, number> = {
  PME: 1,
  VT: 4,
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function defaultNextDueDate(type: ComplianceType, completedDateISO: string): string {
  return toISODate(addYears(parseISO(completedDateISO), VALIDITY_YEARS[type]))
}

export function calculateAge(dobISO: string): number {
  return differenceInYears(new Date(), parseISO(dobISO))
}

export function formatDisplayDate(dateISO?: string): string {
  if (!dateISO) return '—'
  return format(parseISO(dateISO), 'dd MMM yyyy')
}

export function isOverdue(dueDateISO?: string): boolean {
  if (!dueDateISO) return false
  return isBefore(parseISO(dueDateISO), new Date())
}

export function isSameMonthAndYear(dateISO: string, reference: Date): boolean {
  const d = parseISO(dateISO)
  return d.getMonth() === reference.getMonth() && d.getFullYear() === reference.getFullYear()
}

export function isSameYear(dateISO: string, reference: Date): boolean {
  return parseISO(dateISO).getFullYear() === reference.getFullYear()
}

export function isDateAfter(dateISO: string, reference: Date): boolean {
  return isAfter(parseISO(dateISO), reference)
}

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function isInMonth(dateISO: string, year: number, month: number): boolean {
  const [y, m] = dateISO.split('-').map(Number)
  return y === year && m === month + 1
}

export function countByMonth(dates: string[], year: number): number[] {
  return MONTH_LABELS.map((_, month) => dates.filter((d) => isInMonth(d, year, month)).length)
}
