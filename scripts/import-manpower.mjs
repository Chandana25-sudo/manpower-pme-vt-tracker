// One-time import of Book1 (1).xlsx into Firestore.
// Usage: node scripts/import-manpower.mjs <admin-email> <admin-password>
import { config as loadEnv } from 'dotenv'
import { readFileSync } from 'fs'
import * as XLSX from 'xlsx'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, collection, writeBatch } from 'firebase/firestore'
import { addYears, format, parseISO } from 'date-fns'

loadEnv({ path: '.env.local' })

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/import-manpower.mjs <admin-email> <admin-password>')
  process.exit(1)
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const KNOWN_TYPOS = {
  '2301.2023': '23.01.2023',
  '04.04.20222': '04.04.2022',
}

function parseDMY(raw) {
  if (!raw) return undefined
  let value = raw.trim()
  if (!value || value.toUpperCase() === 'NA') return undefined
  value = KNOWN_TYPOS[value] ?? value
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
  if (!match) {
    console.warn(`Skipping unparseable date: "${raw}"`)
    return undefined
  }
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const VALIDITY_YEARS = { PME: 1, VT: 4 }

function computeNextDueDate(type, isoDate) {
  return format(addYears(parseISO(isoDate), VALIDITY_YEARS[type]), 'yyyy-MM-dd')
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

async function run() {
  await signInWithEmailAndPassword(auth, email, password)
  console.log('Signed in as', email)

  const workbook = XLSX.read(readFileSync('Book1 (1).xlsx'))
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: false })
  console.log(`Read ${rows.length} rows`)

  const now = todayISO()
  const operations = []

  for (const row of rows) {
    const uan = (row['Man no'] ?? '').toString().trim()
    const name = (row['EMP_NAME'] ?? '').toString().trim()
    const dob = parseDMY(row['DATE OF BIRTH'])
    const pmeDate = parseDMY(row['Last PME date'])
    const vtDate = parseDMY(row['Last V.T date'])

    if (!uan || !name || !dob) {
      console.warn('Skipping row with missing mandatory field:', row)
      continue
    }

    const manpowerRef = doc(db, 'manpower', uan)
    const manpowerData = {
      uan,
      name,
      dob,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    if (pmeDate) {
      manpowerData.lastPmeDate = pmeDate
      manpowerData.nextPmeDueDate = computeNextDueDate('PME', pmeDate)
    }
    if (vtDate) {
      manpowerData.lastVtDate = vtDate
      manpowerData.nextVtDueDate = computeNextDueDate('VT', vtDate)
    }
    operations.push({ ref: manpowerRef, data: manpowerData })

    if (pmeDate) {
      operations.push({
        ref: doc(collection(db, 'complianceEvents')),
        data: {
          uan,
          type: 'PME',
          completedDate: pmeDate,
          nextDueDate: computeNextDueDate('PME', pmeDate),
          recordedAt: now,
        },
      })
    }
    if (vtDate) {
      operations.push({
        ref: doc(collection(db, 'complianceEvents')),
        data: {
          uan,
          type: 'VT',
          completedDate: vtDate,
          nextDueDate: computeNextDueDate('VT', vtDate),
          recordedAt: now,
        },
      })
    }
  }

  console.log(`Writing ${operations.length} documents in batches of 500...`)
  for (let i = 0; i < operations.length; i += 500) {
    const batch = writeBatch(db)
    for (const op of operations.slice(i, i + 500)) {
      batch.set(op.ref, op.data)
    }
    await batch.commit()
    console.log(`Committed ${Math.min(i + 500, operations.length)}/${operations.length}`)
  }

  console.log('Import complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
