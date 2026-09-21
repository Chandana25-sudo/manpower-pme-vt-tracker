import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { DeletionReason, ManpowerRecord } from '@/types/manpower'
import { calculateAge } from '@/utils/dateUtils'

const reasons: DeletionReason[] = ['Retired', 'Transferred']

interface DeleteFlowModalProps {
  record: ManpowerRecord
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: DeletionReason) => Promise<void>
}

type Step = 'confirm' | 'reason'

export function DeleteFlowModal({ record, isOpen, onClose, onConfirm }: DeleteFlowModalProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [selectedReason, setSelectedReason] = useState<DeletionReason | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    setStep('confirm')
    setSelectedReason(null)
    onClose()
  }

  async function handleSubmit() {
    if (!selectedReason) return
    setIsSubmitting(true)
    try {
      await onConfirm(selectedReason)
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Delete entry" isOpen={isOpen} onClose={handleClose}>
      {step === 'confirm' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-black/[0.03] p-3 text-sm text-ink">
            <p>
              <span className="font-medium">UMAN:</span> {record.uan}
            </p>
            <p>
              <span className="font-medium">Name:</span> {record.name}
            </p>
            <p>
              <span className="font-medium">Age:</span> {calculateAge(record.dob)}
            </p>
          </div>
          <p className="text-sm text-ink-secondary">
            This removes {record.name} from the active roster. Their PME/VT history is kept, not deleted.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setStep('reason')}>
              Confirm
            </Button>
          </div>
        </div>
      )}

      {step === 'reason' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-ink-secondary">Reason for deleting</p>
          <div className="flex flex-col gap-2">
            {reasons.map((reason) => (
              <label key={reason} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="delete-reason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                />
                {reason}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStep('confirm')}>
              Back
            </Button>
            <Button variant="danger" disabled={!selectedReason || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
