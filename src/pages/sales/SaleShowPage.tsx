import { Bell, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { notificationsApi, salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { LoadingState } from '../../components/PageState'
import SaleItemLabel from '../../components/SaleItemLabel'
import StatusPill from '../../components/StatusPill'
import { formatDate, money, prettyLabel, saleTotal } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import { errorToast, successToast } from '../../lib/swal'
import type { Sale } from '../../types'

export default function SaleShowPage() {
  const { id } = useParams()
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNotify, setShowNotify] = useState(false)
  const [sending, setSending] = useState(false)
  const [notifyStatus, setNotifyStatus] = useState<'processing' | 'completed' | 'cancelled'>('processing')
  const [notifySms, setNotifySms] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setSale(await salesApi.get(id))
      } catch (err) {
        errorToast(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSending(true)
    try {
      const result = await notificationsApi.sendSaleStatusNotification(id, {
        status: notifyStatus,
        send_sms: notifySms,
      })
      successToast(
        `Notification sent.${result.data.sms_sent ? ' SMS delivered.' : ' SMS was not sent.'}` +
        (result.data.sms_error ? ` Error: ${result.data.sms_error}` : '')
      )
      setShowNotify(false)
    } catch (err) {
      errorToast(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell
      pageTitle={sale ? `Sale #${sale.id}` : 'Sale'}
      pageSubtitle="Full sale record including line items."
      action={sale ? (
        <div className="action-row">
          <Link to={`/sales/${sale.id}/receipt`} className="primary-button">Open receipt</Link>
          <Link to={`/sales/${sale.id}/edit`} className="secondary-button">
            <Pencil size={16} /> Edit
          </Link>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowNotify(true)}
          >
            <Bell size={16} /> Notify customer
          </button>
        </div>
      ) : undefined}
    >

      {showNotify && (
        <section className="panel module-panel" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>Send Status Update to Customer</h3>
          <form onSubmit={handleNotify}>
            <div className="field-grid">
              <label>
                <span>Order Status</span>
                <select value={notifyStatus} onChange={(e) => setNotifyStatus(e.target.value as 'processing' | 'completed' | 'cancelled')}>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
              />
              <span>Send SMS to customer</span>
            </label>
            <div className="action-row" style={{ marginTop: 16 }}>
              <button type="submit" className="primary-button" disabled={sending}>
                {sending ? 'Sending...' : 'Send notification'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowNotify(false)}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading || !sale ? <LoadingState /> : (
        <section className="module-grid">
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Customer</span>
                <strong>{sale.customer?.name ?? sale.customer_name ?? `#${sale.customer_id ?? '—'}`}</strong>
              </div>
              <div className="summary-card">
                <span>Total</span>
                <strong>{money(saleTotal(sale))}</strong>
              </div>
              <div className="summary-card">
                <span>Payment</span>
                <strong>{prettyLabel(sale.payment_method ?? sale.payment_status ?? 'pending')}</strong>
              </div>
            </div>
            <p style={{ marginTop: 16 }}>
              <StatusPill value={sale.payment_status ?? sale.status ?? 'pending'} />
              {sale.job_status && <><span> · </span><StatusPill value={sale.job_status} /></>}
              {' · '}{formatDate(sale.transaction_date ?? sale.created_at ?? '')}
            </p>
            {sale.notes && <p>{sale.notes}</p>}
          </div>
          <div className="panel module-panel">
            <div className="inventory-list">
              {(sale.items ?? []).map((item) => {
                const lineTotal = item.total_price ?? item.subtotal ?? item.quantity * item.unit_price

                return (
                  <div className="inventory-item sale-line" key={item.id}>
                    <div className="line-label">
                      <SaleItemLabel item={item} />
                      <small className="line-meta">{item.quantity} × {money(item.unit_price)}</small>
                    </div>
                    <strong>{money(lineTotal)}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  )
}
