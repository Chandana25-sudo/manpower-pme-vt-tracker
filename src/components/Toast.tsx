import { useEffect } from 'react'

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-sm font-medium text-white shadow-tile-hover">
      {message}
    </div>
  )
}
