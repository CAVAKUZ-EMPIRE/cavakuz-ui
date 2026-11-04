import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { buildTicks, compactMoney } from '../lib/chart'
import { money } from '../lib/format'
import type { FinancialMonth } from '../types'

const MONTHS_SHOWN = 6

type Column = {
  key: string
  label: string
  year: number
  longLabel: string
  revenue: number
  sales: number
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const buildColumns = (months: FinancialMonth[]): Column[] => {
  const byKey = new Map(months.map((month) => [month.month, month]))
  const now = new Date()

  return Array.from({ length: MONTHS_SHOWN }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - index), 1)
    const key = monthKey(date)
    const entry = byKey.get(key)

    return {
      key,
      label: date.toLocaleString('en-GB', { month: 'short' }),
      year: date.getFullYear(),
      longLabel: date.toLocaleString('en-GB', { month: 'long', year: 'numeric' }),
      revenue: Number(entry?.total_amount ?? 0),
      sales: Number(entry?.sales_count ?? 0),
    }
  })
}

export default function RevenueBarChart({ months }: { months: FinancialMonth[] }) {
  const columns = buildColumns(months)
  const peak = Math.max(...columns.map((column) => column.revenue))

  if (peak <= 0) {
    return <p className="empty-state">No sales recorded in the last {MONTHS_SHOWN} months yet.</p>
  }

  const { ceiling, ticks } = buildTicks(peak)

  const total = columns.reduce((sum, column) => sum + column.revenue, 0)
  const best = columns.reduce((winner, column) => (column.revenue > winner.revenue ? column : winner))
  const current = columns[columns.length - 1]
  const previous = columns[columns.length - 2]
  const change = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : null

  return (
    <div className="rchart-wrap">
      <div className="rchart-summary">
        <div>
          <span>Last {MONTHS_SHOWN} months</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Monthly average</span>
          <strong>{money(total / MONTHS_SHOWN)}</strong>
        </div>
        <div>
          <span>Best month</span>
          <strong>{best.longLabel}</strong>
        </div>
        {change !== null && (
          <div className={`rchart-trend ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <strong>{Math.abs(change).toFixed(0)}%</strong>
            <span>vs {previous.label}</span>
          </div>
        )}
      </div>

      <div className="rchart" style={{ '--chart-height': '240px' } as CSSProperties} role="group" aria-label={`Monthly revenue for the last ${MONTHS_SHOWN} months`}>
        <div className="rchart-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick.percent} style={{ bottom: `${tick.percent}%` }}>{compactMoney.format(tick.value)}</span>
          ))}
        </div>

        <div className="rchart-plot">
          {ticks.map((tick) => (
            <div className="rchart-gridline" key={tick.percent} style={{ bottom: `${tick.percent}%` }} />
          ))}
          <div className="rchart-bars">
            {columns.map((column, index) => {
              const percent = (column.revenue / ceiling) * 100
              const isCurrent = column.key === current.key

              return (
                <div
                  className={`rchart-col ${isCurrent ? 'is-current' : ''} ${column.revenue === 0 ? 'is-empty' : ''}`}
                  key={column.key}
                  tabIndex={0}
                  aria-label={`${column.longLabel}: ${money(column.revenue)} from ${column.sales} ${column.sales === 1 ? 'sale' : 'sales'}`}
                  style={{ '--i': index } as CSSProperties}
                >
                  <div className="rchart-tip" style={{ bottom: `calc(${percent}% + 34px)` }} aria-hidden="true">
                    <small>{column.longLabel}</small>
                    <strong>{money(column.revenue)}</strong>
                    <small>{column.sales} {column.sales === 1 ? 'sale' : 'sales'}</small>
                  </div>
                  {column.revenue > 0 && <span className="rchart-value">{compactMoney.format(column.revenue)}</span>}
                  <div className="rchart-bar" style={{ height: `${percent}%` }} />
                </div>
              )
            })}
          </div>
        </div>

        <div />
        <div className="rchart-xlabels">
          {columns.map((column) => (
            <span key={column.key} className={column.key === current.key ? 'is-current' : ''}>
              {column.label}
              <small>{column.year}</small>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
