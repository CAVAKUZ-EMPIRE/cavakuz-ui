import { useEffect, useMemo, useState } from 'react'
import { dashboardApi, expensesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Expense, FinancialMonth } from '../../types'

export default function FinancialReportPage() {
  const [months, setMonths] = useState<FinancialMonth[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [report, nextExpenses] = await Promise.all([
          dashboardApi.financialReport(),
          expensesApi.list(),
        ])
        setMonths(report)
        setExpenses(nextExpenses)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const totals = useMemo(() => {
    const income = months.reduce((sum, month) => sum + Number(month.total_amount || 0), 0)
    const salesCount = months.reduce((sum, month) => sum + Number(month.sales_count || 0), 0)
    const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.total || 0), 0)
    return { income, salesCount, expenseTotal, net: income - expenseTotal }
  }, [months, expenses])

  return (
    <AppShell pageTitle="Financial report" pageSubtitle="Monthly revenue grouped by the reports API.">
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="module-grid">
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Total income</span>
                <strong>{money(totals.income)}</strong>
              </div>
              <div className="summary-card">
                <span>Sales count</span>
                <strong>{totals.salesCount}</strong>
              </div>
              <div className="summary-card">
                <span>Expenses</span>
                <strong>{money(totals.expenseTotal)}</strong>
              </div>
              <div className="summary-card">
                <span>Net</span>
                <strong>{money(totals.net)}</strong>
              </div>
            </div>
          </div>
          <div className="panel module-panel">
            <div className="report-list">
              {months.map((month) => (
                <div className="report-row" key={month.month}>
                  <span>{month.month || 'Unknown month'}</span>
                  <strong>{money(month.total_amount)} · {month.sales_count} sales</strong>
                </div>
              ))}
              {!months.length && <EmptyState label="No financial data yet." />}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  )
}
