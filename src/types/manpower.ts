export type ComplianceType = 'PME' | 'VT'

export type ManpowerStatus = 'active' | 'retired' | 'transferred'

export type DeletionReason = 'Retired' | 'Transferred'

export interface ComplianceEvent {
  id: string
  uan: string
  type: ComplianceType
  completedDate: string
  nextDueDate: string
  notes?: string
  recordedAt: string
}

export interface ManpowerRecord {
  uan: string
  name: string
  dob: string
  status: ManpowerStatus
  deactivationReason?: DeletionReason
  deactivatedAt?: string
  lastPmeDate?: string
  nextPmeDueDate?: string
  lastVtDate?: string
  nextVtDueDate?: string
  createdAt: string
  updatedAt: string
}

export interface NewManpowerInput {
  name: string
  uan: string
  dob: string
  pmeDate?: string
  vtDate?: string
}

export interface RecordComplianceInput {
  uan: string
  type: ComplianceType
  completedDate: string
  nextDueDate: string
  notes?: string
}

export interface CompletionRecord {
  uan: string
  name: string
  type: ComplianceType
  completedDate: string
  nextDueDate: string
}

export interface MonthlyBreakdownRow {
  month: number
  label: string
  pmeCount: number
  vtCount: number
}
