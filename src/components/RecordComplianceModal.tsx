import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { FormField } from './FormField'
import type { ComplianceType } from '@/types/manpower'
import { defaultNextDueDate, todayISO } from '@/utils/dateUtils'

interface RecordComplianceModalProps {
  type: ComplianceType
  isOpen: boolean
  onClose: () => void
  onSubmit: (completedDate: string, nextDueDate: string, notes?: string) => Promise<void>
}

export function RecordComplianceModal({ type, isOpen, onClose, onSubmit }: RecordComplianceModalProps) {
  const [completedDate, setCompletedDate] = useState(todayISO())
  const [nextDueDate, setNextDueDate] = useState(defaultNextDueDate(type, todayISO()))
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCompletedDateChange(value: string) {
    setCompletedDate(value)
    setNextDueDate(defaultNextDueDate(type, value))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      await onSubmit(completedDate, nextDueDate, notes || undefined)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={`Update ${type}`} isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FormField
          label="Completed date"
          type="date"
          required
          value={completedDate}
          onChange={(e) => handleCompletedDateChange(e.target.value)}
        />
        <FormField
          label="Next due date"
          type="date"
          required
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
        />
        <FormField
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
