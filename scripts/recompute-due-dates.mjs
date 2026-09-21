// One-time fix: recompute nextPmeDueDate/nextVtDueDate and complianceEvents.nextDueDate
// using PME = +1 year, VT = +4 years (previously both defaulted to +1 year, and the
// initial import used naive date math that produced invalid dates like 2025-02-29).
// Usage: node scripts/recompute-due-dates.mjs <admin-email> <admin-password>
import { config as loadEnv } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore'
import { addYears, format, parseISO } from 'date-fns'

loadEnv({ path: '.env.local' })

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/recompute-due-dates.mjs <admin-email> <admin-password>')
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

const VALIDITY_YEARS = { PME: 1, VT: 4 }

function computeNextDueDate(type, isoDate) {
  return format(addYears(parseISO(isoDate), VALIDITY_YEARS[type]), 'yyyy-MM-dd')
}

async function commitInChunks(operations) {
  for (let i = 0; i < operations.length; i += 500) {
    const batch = writeBatch(db)
    for (const op of operations.slice(i, i + 500)) {
      batch.update(op.ref, op.data)
    }
    await batch.commit()
    console.log(`Committed ${Math.min(i + 500, operations.length)}/${operations.length}`)
  }
}

async function run() {
  await signInWithEmailAndPassword(auth, email, password)
  console.log('Signed in as', email)

  const manpowerSnap = await getDocs(collection(db, 'manpower'))
  const manpowerOps = []
  for (const d of manpowerSnap.docs) {
    const data = d.data()
    const patch = {}
    if (data.lastPmeDate) patch.nextPmeDueDate = computeNextDueDate('PME', data.lastPmeDate)
    if (data.lastVtDate) patch.nextVtDueDate = computeNextDueDate('VT', data.lastVtDate)
    if (Object.keys(patch).length > 0) manpowerOps.push({ ref: d.ref, data: patch })
  }
  console.log(`Recomputing ${manpowerOps.length} manpower docs...`)
  await commitInChunks(manpowerOps)

  const eventsSnap = await getDocs(collection(db, 'complianceEvents'))
  const eventOps = []
  for (const d of eventsSnap.docs) {
    const data = d.data()
    const nextDueDate = computeNextDueDate(data.type, data.completedDate)
    if (nextDueDate !== data.nextDueDate) {
      eventOps.push({ ref: d.ref, data: { nextDueDate } })
    }
  }
  console.log(`Recomputing ${eventOps.length} complianceEvents docs...`)
  await commitInChunks(eventOps)

  console.log('Done.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
