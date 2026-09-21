import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
}

export function FormField({ label, required, error, id, className = '', ...rest }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-secondary">
        {label}
        {required && <span className="text-status-critical"> *</span>}
      </label>
      <input
        id={fieldId}
        className={`rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        required={required}
        {...rest}
      />
      {error && <span className="text-xs text-status-critical">{error}</span>}
    </div>
  )
}
