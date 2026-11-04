import type { CSSProperties } from 'react'
import { buildTicks, compactMoney } from '../lib/chart'
import { money } from '../lib/format'
import type { DailyReportDay } from '../types'

const MAX_LABELS = 12
const FOCUSABLE_LIMIT = 31

const parseDay = (iso: string) => new Date(`${iso}T00:00:00`)

export default function DailyBarChart({ days }: { days: DailyReportDay[] }) {
  const peak = Math.max(0, ...days.map((day) => Math.max(day.revenue, day.expenses)))

  if (peak <= 0) {
    return <p className="empty-state">No sales or expenses recorded in this period.</p>
  }

  const { ceiling, ticks } = buildTicks(peak)
  const grid: CSSProperties = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }
  const labelEvery = Math.ceil(days.length / MAX_LABELS)
  const compactDays = days.length <= 14

  return (
    <div className="rchart-wrap">
      <div className="rchart-legend">
        <span><i className="revenue" /> Revenue</span>
        <span><i className="expense" /> Expenses</span>
      </div>

      <div className="rchart" style={{ '--chart-height': '260px' } as CSSProperties} role="group" aria-label="Daily revenue and expenses">
        <div className="rchart-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick.percent} style={{ bottom: `${tick.percent}%` }}>{compactMoney.format(tick.value)}</span>
          ))}
        </div>

        <div className="rchart-plot">
          {ticks.map((tick) => (
            <div className="rchart-gridline" key={tick.percent} style={{ bottom: `${tick.percent}%` }} />
          ))}
          <div className="rchart-bars" style={{ ...grid, gap: days.length > 31 ? 2 : days.length > 14 ? 5 : 12 }}>
            {days.map((day, index) => {
              const revenuePercent = (day.revenue / ceiling) * 100
              const expensePercent = (day.expenses / ceiling) * 100
              const tipAlign = index < 3 ? 'tip-start' : index >= days.length - 3 ? 'tip-end' : ''
              const label = parseDay(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <div
                  className="rchart-col"
                  key={day.date}
                  role="img"
                  tabIndex={days.length <= FOCUSABLE_LIMIT ? 0 : undefined}
                  aria-label={`${label}: revenue ${money(day.revenue)}, expenses ${money(day.expenses)}`}
                  style={{ '--i': Math.min(index, 30) * 0.2 } as CSSProperties}
                >
                  <div className={`rchart-tip ${tipAlign}`} style={{ bottom: `calc(${Math.max(revenuePercent, expensePercent)}% + 14px)` }} aria-hidden="true">
                    <small>{label}</small>
                    <strong>{money(day.revenue)}</strong>
                    <small>Expenses {money(day.expenses)}</small>
                    <small className={day.net >= 0 ? 'net-up' : 'net-down'}>Net {money(day.net)}</small>
                    <small>{day.sales_count} {day.sales_count === 1 ? 'sale' : 'sales'}</small>
                  </div>
                  <div className="rchart-pair">
                    <div className="rchart-bar" style={{ height: `${revenuePercent}%`, minHeight: day.revenue > 0 ? 3 : 0 }} />
                    <div className="rchart-bar expense" style={{ height: `${expensePercent}%`, minHeight: day.expenses > 0 ? 3 : 0 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div />
        <div className="rchart-xlabels" style={{ ...grid, gap: days.length > 31 ? 2 : days.length > 14 ? 5 : 12 }}>
          {days.map((day, index) => {
            const date = parseDay(day.date)
            const visible = (days.length - 1 - index) % labelEvery === 0

            return (
              <span key={day.date} className="rchart-xlabel">
                {visible && (
                  <>
                    {date.getDate()}
                    <small>{date.toLocaleDateString('en-GB', compactDays ? { weekday: 'short' } : { month: 'short' })}</small>
                  </>
                )}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
