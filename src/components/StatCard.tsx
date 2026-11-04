import type { ReactNode } from 'react'

export default function StatCard({
  title,
  value,
  icon,
  tone,
  note,
}: {
  title: string
  value: string
  icon: ReactNode
  tone: string
  note: string
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <div className="stat-change"><small>{note}</small></div>
      </div>
    </div>
  )
}
