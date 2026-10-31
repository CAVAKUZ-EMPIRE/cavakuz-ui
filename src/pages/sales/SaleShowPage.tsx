import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import StatusPill from '../../components/StatusPill'
import { formatDate, money, prettyLabel } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Sale } from '../../types'

export default function SaleShowPage() {
  const { id } = useParams()
  const [sale, setSale] = useState<Sale | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setSale(await salesApi.get(id))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  return (
    <AppShell
      pageTitle={sale ? `Sale #${sale.id}` : 'Sale'}
      pageSubtitle="Full sale record including line items."
      action={sale ? <Link to={`/sales/${sale.id}/receipt`} className="primary-button">Open receipt</Link> : undefined}
    >
      {error && <Alert>{error}</Alert>}
      {loading || !sale ? <LoadingState /> : (
        <section className="module-grid">
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Customer</span>
                <strong>{sale.customer?.name ?? `#${sale.customer_id}`}</strong>
              </div>
              <div className="summary-card">
                <span>Total</span>
                <strong>{money(sale.total_amount)}</strong>
              </div>
              <div className="summary-card">
                <span>Payment</span>
                <strong>{prettyLabel(sale.payment_method)}</strong>
              </div>
            </div>
            <p style={{ marginTop: 16 }}><StatusPill value={sale.payment_status} /> · {formatDate(sale.transaction_date)}</p>
            {sale.notes && <p>{sale.notes}</p>}
          </div>
          <div className="panel module-panel">
            <div className="inventory-list">
              {(sale.items ?? []).map((item) => (
                <div className="inventory-item" key={item.id}>
                  <div>
                    <strong>{item.inventory?.name ?? `Item #${item.inventory_id}`}</strong>
                    <small>{item.quantity} × {money(item.unit_price)}</small>
                  </div>
                  <strong>{money(item.total_price)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  )
}
