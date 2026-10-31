import { ArrowUpRight, Boxes, CheckSquare, Users, Wallet } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, expensesApi, tasksApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import StatusPill from '../../components/StatusPill'
import { formatDate, money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { DashboardSummary, Expense, Task } from '../../types'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [dashboard, nextTasks, nextExpenses] = await Promise.all([
          isAdmin ? dashboardApi.admin() : dashboardApi.summary(),
          tasksApi.list(),
          expensesApi.list(),
        ])
        setSummary(dashboard)
        setTasks(nextTasks)
        setExpenses(nextExpenses)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [isAdmin])

  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const openTasks = tasks.filter((task) => task.status !== 'completed').length

  return (
    <AppShell
      pageTitle={`Welcome back, ${user?.name ?? 'team'}`}
      pageSubtitle={
        isAdmin
          ? 'Admin overview of customers, sales, tasks, and expenses.'
          : 'Stay on top of customers, stock, tasks, and payments.'
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading || !summary ? (
        <LoadingState label="Loading dashboard..." />
      ) : (
        <>
          <section className="stats-grid">
            <StatCard title="Total customers" value={String(summary.total_customers)} icon={<Users />} tone="blue" note="in the directory" />
            <StatCard title="Total sales" value={String(summary.total_sales)} icon={<CheckSquare />} tone="green" note="recorded transactions" />
            <StatCard title="Open tasks" value={String(openTasks)} icon={<Boxes />} tone="orange" note="still in progress" />
            <StatCard title="Total revenue" value={money(summary.total_revenue)} icon={<Wallet />} tone="purple" note="all recorded sales" />
          </section>

          <section className="overview-grid">
            <div className="panel sales-panel">
              <PanelHeading title="Recent sales" subtitle="Latest recorded transactions" action="View all" to="/sales" />
              <div className="records-list">
                {summary.recent_sales.length ? (
                  summary.recent_sales.map((sale) => (
                    <Link className="record-row" key={sale.id} to={`/sales/${sale.id}`}>
                      <div className="record-icon"><Wallet size={18} /></div>
                      <div className="record-copy">
                        <strong>{sale.customer?.name ?? `Customer #${sale.customer_id}`}</strong>
                        <small>{formatDate(sale.transaction_date)}</small>
                      </div>
                      <div className="record-amount">
                        <strong>{money(sale.total_amount)}</strong>
                        <StatusPill value={sale.payment_status} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState label="No sales recorded yet." />
                )}
              </div>
            </div>

            <div className="panel payment-panel">
              <PanelHeading title="Payment health" subtitle="Outstanding vs completed" />
              <div className="summary-stack">
                <div className="summary-card highlight">
                  <span>Pending payments</span>
                  <strong>{summary.pending_payments}</strong>
                </div>
                <div className="summary-card">
                  <span>Expense total</span>
                  <strong>{money(expenseTotal)}</strong>
                </div>
                <div className="summary-card">
                  <span>Estimated net</span>
                  <strong>{money(summary.total_revenue - expenseTotal)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel">
              <PanelHeading title="Tasks" subtitle="Work currently in motion" action="Manage" to="/tasks" />
              <div className="task-list">
                {tasks.slice(0, 6).map((task) => (
                  <div className="task-row" key={task.id}>
                    <div className="task-info">
                      <strong>{task.name}</strong>
                      <StatusPill value={task.status} />
                    </div>
                    <div className="progress-line">
                      <div className="progress">
                        <div className={`progress-bar ${task.status === 'completed' ? 'complete' : ''}`} style={{ width: `${task.progress}%` }} />
                      </div>
                      <small>{task.progress}%</small>
                    </div>
                  </div>
                ))}
                {!tasks.length && <EmptyState label="No tasks yet." />}
              </div>
            </div>

            <div className="panel">
              <PanelHeading title="Quick actions" subtitle="Jump into the next job" />
              <div className="quick-actions">
                <Link className="action-chip" to="/customers/new"><Users size={15} /> Add customer</Link>
                <Link className="action-chip" to="/inventory/new"><Boxes size={15} /> Add inventory</Link>
                <Link className="action-chip" to="/sales/new"><Wallet size={15} /> Record sale</Link>
                <Link className="action-chip" to="/reports/financial"><ArrowUpRight size={15} /> Financial report</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </AppShell>
  )
}

function StatCard({
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

function PanelHeading({
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
