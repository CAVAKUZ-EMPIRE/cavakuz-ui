import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="panel module-panel">
      <p className="empty-state">{label}</p>
    </div>
  )
}

export function EmptyState({ label }: { label: string }) {
  return <p className="empty-state">{label}</p>
}

export function Alert({ tone = 'danger', children }: { tone?: 'danger' | 'success'; children: ReactNode }) {
  return (
    <div className={`page-alert ${tone}`} role="alert">
      {children}
    </div>
  )
}
