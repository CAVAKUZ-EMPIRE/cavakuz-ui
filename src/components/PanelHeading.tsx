import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PanelHeading({
  title,
  subtitle,
  action,
  to,
}: {
  title: string
  subtitle: string
  action?: string
  to?: string
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action && to && (
        <Link className="panel-action" to={to}>
          {action} <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  )
}
