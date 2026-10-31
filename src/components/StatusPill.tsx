import { prettyLabel, statusClass } from '../lib/format'

export default function StatusPill({ value }: { value?: string | null }) {
  return <span className={`status-pill ${statusClass(value)}`}>{prettyLabel(value)}</span>
}
