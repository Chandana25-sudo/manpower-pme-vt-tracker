import { Button } from './Button'

export function ExportButton({ onExport, label = 'Export' }: { onExport: () => void; label?: string }) {
  return (
    <Button variant="secondary" onClick={onExport} className="whitespace-nowrap">
      ⬇ {label}
    </Button>
  )
}
