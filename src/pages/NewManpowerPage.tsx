import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/Button'
import { createManpower } from '@/firebase/manpower'

export function NewManpowerPage() {
  const [name, setName] = useState('')
  const [uan, setUan] = useState('')
  const [dob, setDob] = useState('')
  const [pmeDate, setPmeDate] = useState('')
  const [vtDate, setVtDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await createManpower({
        name,
        uan,
        dob,
        pmeDate: pmeDate || undefined,
        vtDate: vtDate || undefined,
      })
      navigate('/search', { state: { uan } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <h1 className="mb-4 text-lg font-semibold text-ink">New manpower entry</h1>
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
        <FormField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <FormField label="UMAN Number" required value={uan} onChange={(e) => setUan(e.target.value)} />
        <FormField
          label="Date of Birth"
          type="date"
          required
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <FormField
          label="PME date (optional)"
          type="date"
          value={pmeDate}
          onChange={(e) => setPmeDate(e.target.value)}
        />
        <FormField
          label="VT date (optional)"
          type="date"
          value={vtDate}
          onChange={(e) => setVtDate(e.target.value)}
        />
        {error && <p className="text-sm text-status-critical">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create entry'}
        </Button>
      </form>
    </Layout>
  )
}
