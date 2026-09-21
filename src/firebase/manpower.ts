import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'
import type {
  ComplianceEvent,
  ComplianceType,
  CompletionRecord,
  ManpowerRecord,
  NewManpowerInput,
  RecordComplianceInput,
  DeletionReason,
} from '@/types/manpower'
import { defaultNextDueDate, todayISO } from '@/utils/dateUtils'

const MANPOWER_COLLECTION = 'manpower'
const COMPLIANCE_COLLECTION = 'complianceEvents'

function manpowerDoc(uan: string) {
  return doc(db, MANPOWER_COLLECTION, uan)
}

export async function getManpowerByUan(uan: string): Promise<ManpowerRecord | null> {
  const snapshot = await getDoc(manpowerDoc(uan))
  return snapshot.exists() ? (snapshot.data() as ManpowerRecord) : null
}

export async function listActiveManpower(): Promise<ManpowerRecord[]> {
  const snapshot = await getDocs(
    query(collection(db, MANPOWER_COLLECTION), where('status', '==', 'active')),
  )
  return snapshot.docs.map((d) => d.data() as ManpowerRecord)
}

export async function listAllManpower(): Promise<ManpowerRecord[]> {
  const snapshot = await getDocs(collection(db, MANPOWER_COLLECTION))
  return snapshot.docs.map((d) => d.data() as ManpowerRecord)
}

export async function createManpower(input: NewManpowerInput): Promise<void> {
  const existing = await getManpowerByUan(input.uan)
  if (existing) {
    throw new Error(`A record with UMAN ${input.uan} already exists`)
  }

  const now = todayISO()
  const record: ManpowerRecord = {
    uan: input.uan,
    name: input.name,
    dob: input.dob,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(manpowerDoc(input.uan), record)

  if (input.pmeDate) {
    await recordCompliance({
      uan: input.uan,
      type: 'PME',
      completedDate: input.pmeDate,
      nextDueDate: defaultNextDueDate('PME', input.pmeDate),
    })
  }
  if (input.vtDate) {
    await recordCompliance({
      uan: input.uan,
      type: 'VT',
      completedDate: input.vtDate,
      nextDueDate: defaultNextDueDate('VT', input.vtDate),
    })
  }
}

export async function recordCompliance(input: RecordComplianceInput): Promise<void> {
  const event: Omit<ComplianceEvent, 'id'> = {
    uan: input.uan,
    type: input.type,
    completedDate: input.completedDate,
    nextDueDate: input.nextDueDate,
    notes: input.notes,
    recordedAt: todayISO(),
  }
  await addDoc(collection(db, COMPLIANCE_COLLECTION), event)

  const updateFields =
    input.type === 'PME'
      ? { lastPmeDate: input.completedDate, nextPmeDueDate: input.nextDueDate }
      : { lastVtDate: input.completedDate, nextVtDueDate: input.nextDueDate }

  await updateDoc(manpowerDoc(input.uan), { ...updateFields, updatedAt: todayISO() })
}

export async function getComplianceHistory(
  uan: string,
  type?: ComplianceType,
): Promise<ComplianceEvent[]> {
  const clauses = [where('uan', '==', uan)]
  if (type) clauses.push(where('type', '==', type))

  const snapshot = await getDocs(
    query(collection(db, COMPLIANCE_COLLECTION), ...clauses, orderBy('completedDate', 'desc')),
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ComplianceEvent, 'id'>) }))
}

export async function deactivateManpower(uan: string, reason: DeletionReason): Promise<void> {
  await updateDoc(manpowerDoc(uan), {
    status: reason === 'Retired' ? 'retired' : 'transferred',
    deactivationReason: reason,
    deactivatedAt: todayISO(),
    updatedAt: todayISO(),
  })
}

export async function reactivateManpower(uan: string): Promise<void> {
  await updateDoc(manpowerDoc(uan), {
    status: 'active',
    deactivationReason: deleteField(),
    deactivatedAt: deleteField(),
    updatedAt: todayISO(),
  })
}

export async function listDeactivatedManpower(): Promise<ManpowerRecord[]> {
  const all = await listAllManpower()
  return all.filter((r) => r.status !== 'active')
}

export async function listPendingPme(): Promise<ManpowerRecord[]> {
  const active = await listActiveManpower()
  const today = todayISO()
  return active
    .filter((r) => !r.nextPmeDueDate || r.nextPmeDueDate <= today)
    .sort((a, b) => (b.nextPmeDueDate ?? '').localeCompare(a.nextPmeDueDate ?? ''))
}

export async function listPendingVt(): Promise<ManpowerRecord[]> {
  const active = await listActiveManpower()
  const today = todayISO()
  return active
    .filter((r) => !r.nextVtDueDate || r.nextVtDueDate <= today)
    .sort((a, b) => (b.nextVtDueDate ?? '').localeCompare(a.nextVtDueDate ?? ''))
}

async function getEventsByType(type: ComplianceType): Promise<ComplianceEvent[]> {
  const snapshot = await getDocs(
    query(collection(db, COMPLIANCE_COLLECTION), where('type', '==', type)),
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ComplianceEvent, 'id'>) }))
}

export async function getCompletionsForType(type: ComplianceType): Promise<CompletionRecord[]> {
  const [events, manpowerList] = await Promise.all([getEventsByType(type), listAllManpower()])
  const nameByUan = new Map(manpowerList.map((m) => [m.uan, m.name]))

  return events
    .map((e) => ({
      uan: e.uan,
      name: nameByUan.get(e.uan) ?? e.uan,
      type: e.type,
      completedDate: e.completedDate,
      nextDueDate: e.nextDueDate,
    }))
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))
}

