import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { logout } from '@/firebase/auth'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/search', label: 'Search UMAN' },
  { to: '/new', label: 'New Entry' },
  { to: '/pending', label: 'PME Pending' },
  { to: '/vt-pending', label: 'VT Pending' },
]

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
        className="flex flex-col gap-1.5 rounded-md p-2 hover:bg-black/5"
      >
        <span className="block h-0.5 w-6 bg-ink" />
        <span className="block h-0.5 w-6 bg-ink" />
        <span className="block h-0.5 w-6 bg-ink" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex w-64 flex-col bg-surface p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold text-ink">Menu</span>
              <button aria-label="Close menu" onClick={() => setIsOpen(false)} className="text-ink-muted">
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-secondary hover:bg-black/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false)
                  void logout()
                }}
                className="mt-4 rounded-md px-3 py-2 text-left text-sm font-medium text-status-critical hover:bg-status-critical/10"
              >
                Log out
              </button>
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  )
}
