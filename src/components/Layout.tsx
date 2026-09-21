import type { ReactNode } from 'react'
import { NavMenu } from './NavMenu'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-hairline bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <NavMenu />
          <div>
            <p className="font-semibold leading-tight text-ink">PME/VT Tracker</p>
            <p className="text-xs leading-tight text-ink-muted">Manpower compliance admin</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
