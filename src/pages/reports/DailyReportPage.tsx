import { CalendarDays, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { dashboardApi } from '../../api'
import AppShell from '../../components/AppShell'
import DailyBarChart from '../../components/DailyBarChart'
import PanelHeading from '../../components/PanelHeading'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import StatCard from '../../components/StatCard'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { DailyReport } from '../../types'

type DateRange = { from: string; to: string }

const pad = (value: number) => String(value).padStart(2, '0')
const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const parseDay = (iso: string) => new Date(`${iso}T00:00:00`)

const lastDays = (days: number): DateRange => {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (days - 1))
  return { from: toIsoDate(from), to: toIsoDate(to) }
}

const thisMonth = (): DateRange => {
  const now = new Date()
  return { from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toIsoDate(now) }
}

const PRESETS: Array<{ label: string; range: () => DateRange }> = [
  { label: '7 days', range: () => lastDays(7) },
  { label: '14 days', range: () => lastDays(14) },
  { label: '30 days', range: () => lastDays(30) },
  { label: '90 days', range: () => lastDays(90) },
  { label: 'This month', range: thisMonth },
]

const dayLabel = (iso: string) =>
  parseDay(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })

const amountOrDash = (value: number) => (value === 0 ? '—' : money(value))

export default function DailyReportPage() {
  const [range, setRange] = useState<DateRange>(() => lastDays(30))
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const data = await dashboardApi.dailyReport(range)
        if (ignore) return
        setReport(data)
        setError('')
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void load()
    return () => {
      ignore = true
    }
  }, [range])

  const applyRange = (next: DateRange) => {
    if (next.from === range.from && next.to === range.to) return
    setLoading(true)
    setRange(next)
  }

  const changeDate = (field: keyof DateRange, value: string) => {
    if (!value) return
    const next = { ...range, [field]: value }
    if (next.from > next.to) {
      if (field === 'from') next.to = value
      else next.from = value
    }
    applyRange(next)
  }

  const peakRevenue = useMemo(() => Math.max(0, ...(report?.days ?? []).map((day) => day.revenue)), [report])
  const today = toIsoDate(new Date())
  const totals = report?.totals
  const margin = totals && totals.revenue > 0 ? (totals.net / totals.revenue) * 100 : null
  const hasActivity = !!totals && (totals.sales_count > 0 || totals.expenses > 0)

  return (
    <AppShell pageTitle="Daily report" pageSubtitle="See how sales, expenses and profit perform each day.">
      <section className="panel dr-toolbar">
        <div className="dr-presets" role="group" aria-label="Quick ranges">
          {PRESETS.map((preset) => {
            const presetRange = preset.range()
            const active = presetRange.from === range.from && presetRange.to === range.to
            return (
              <button key={preset.label} type="button" className={active ? 'active' : ''} aria-pressed={active} onClick={() => applyRange(presetRange)}>
                {preset.label}
              </button>
            )
          })}
        </div>
        <button className='btn btn-success'>Export TO PDF</button>

        <div className="dr-dates">
          <label>
            <span>From</span>
            <input type="date" value={range.from} max={today} onChange={(event) => changeDate('from', event.target.value)} />
          </label>
          <label>
            <span>To</span>
            <input type="date" value={range.to} max={today} onChange={(event) => changeDate('to', event.target.value)} />
          </label>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}
      {loading && !report ? <LoadingState label="Loading daily report..." /> : report && totals && (
        <div className={loading ? 'dr-content is-refreshing' : 'dr-content'}>
          <section className="stats-grid">
            <StatCard title="Revenue" value={money(totals.revenue)} icon={<Wallet />} tone="blue" note={`${totals.sales_count} sales · ${totals.items_sold} items`} />
            <StatCard title="Expenses" value={money(totals.expenses)} icon={<TrendingDown />} tone="orange" note="recorded in this period" />
            <StatCard
              title="Net profit"
              value={money(totals.net)}
              icon={<TrendingUp />}
              tone={totals.net >= 0 ? 'green' : 'orange'}
              note={margin === null ? 'no revenue yet' : `${margin.toFixed(0)}% margin`}
            />
            <StatCard
              title="Average per day"
              value={money(totals.average_daily_revenue)}
              icon={<CalendarDays />}
              tone="purple"
              note={totals.best_day ? `Best: ${dayLabel(totals.best_day.date)} · ${money(totals.best_day.revenue)}` : 'no sales yet'}
            />
          </section>

          <section className="overview-grid">
            <div className="panel revenue-panel">
              <PanelHeading title="Daily performance" subtitle="Revenue against expenses, day by day" />
              <DailyBarChart days={report.days} />
            </div>

            <div className="panel payment-panel">
              <PanelHeading title="Payment status" subtitle="Value of sales by how they were paid" />
              <div className="dr-payments">
                {[
                  { key: 'paid', label: 'Fully paid', value: totals.paid_amount },
                  { key: 'part', label: 'Part paid', value: totals.part_paid_amount },
                  { key: 'unpaid', label: 'Unpaid', value: totals.unpaid_amount },
                ].map((row) => (
                  <div className="dr-payment-row" key={row.key}>
                    <div>
                      <span><i className={row.key} /> {row.label}</span>
                      <strong>{money(row.value)}</strong>
                    </div>
                    <div className="dr-meter">
                      <span className={row.key} style={{ width: `${totals.revenue > 0 ? (row.value / totals.revenue) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel module-panel">
            <PanelHeading title="Day by day" subtitle="Newest first. The bar shows revenue, split by payment status." />
            {hasActivity ? (
              <div className="dr-table-wrap">
                <table className="dr-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th className="num">Sales</th>
                      <th className="dr-revenue-col">Revenue</th>
                      <th className="num">Expenses</th>
                      <th className="num">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...report.days].reverse().map((day) => {
                      const idle = day.sales_count === 0 && day.expenses === 0
                      return (
                        <tr key={day.date} className={idle ? 'is-idle' : ''}>
                          <td>
                            <strong>{dayLabel(day.date)}</strong>
                            {day.date === today && <em className="dr-today">Today</em>}
                          </td>
                          <td className="num">
                            {day.sales_count ? (
                              <span className="dr-sales"><Receipt size={13} /> {day.sales_count}</span>
                            ) : '—'}
                          </td>
                          <td className="dr-revenue-col">
                            <span>{amountOrDash(day.revenue)}</span>
                            {day.revenue > 0 && peakRevenue > 0 && (
                              <div className="dr-bar" style={{ width: `${Math.max((day.revenue / peakRevenue) * 100, 2)}%` }}>
                                <span className="paid" style={{ flexGrow: day.paid_amount }} />
                                <span className="part" style={{ flexGrow: day.part_paid_amount }} />
                                <span className="unpaid" style={{ flexGrow: day.unpaid_amount }} />
                              </div>
                            )}
                          </td>
                          <td className="num">{amountOrDash(day.expenses)}</td>
                          <td className={`num dr-net ${idle ? '' : day.net >= 0 ? 'up' : 'down'}`}>{idle ? '—' : money(day.net)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="No sales or expenses were recorded in this period." />
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
