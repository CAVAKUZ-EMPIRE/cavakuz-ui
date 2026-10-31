import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import StatusPill from '../../components/StatusPill'
import { formatDate, money, prettyLabel } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Sale } from '../../types'

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setSales(await salesApi.list())
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <AppShell
      pageTitle="Sales"
      pageSubtitle="Recorded purchases, payments, and receipts."
      action={<Link to="/sales/new" className="primary-button"><Plus size={16} /> New sale</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
          <div className="table-responsive compact-table">
            <table className="table dashboard-table align-middle">
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{sale.customer?.name ?? `Customer #${sale.customer_id}`}</td>
                    <td>{prettyLabel(sale.payment_method)}</td>
                    <td><StatusPill value={sale.payment_status} /></td>
                    <td>{formatDate(sale.transaction_date)}</td>
                    <td>{money(sale.total_amount)}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-button" to={`/sales/${sale.id}`}>View</Link>
                        <Link className="table-button" to={`/sales/${sale.id}/receipt`}>Receipt</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!sales.length && (
                  <tr>
                    <td colSpan={7}><EmptyState label="No sales yet." /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  )
}
