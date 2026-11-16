import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customersApi, salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { LoadingState } from '../../components/PageState'
import StatusPill from '../../components/StatusPill'
import { formatDate, money, saleTotal } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import { errorToast, successToast } from '../../lib/swal'
import type { Customer, JobStatus, Sale } from '../../types'

const JOB_STATUS_OPTIONS: { value: JobStatus | ''; label: string }[] = [
  { value: '', label: '— Select job status —' },
  { value: 'not_started', label: 'Not started' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'ready_for_pickup', label: 'Ready for pickup' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ORDER_STATUS_OPTIONS = [
  { value: '', label: '— Select status —' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: '— Select payment status —' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'full_payment', label: 'Full payment' },
  { value: 'half_payment', label: 'Half payment' },
  { value: 'not_paid', label: 'Not paid' },
]

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: '— Select method —' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'mobile_money', label: 'Mobile money' },
]

export default function SaleEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])

  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [status, setStatus] = useState('')
  const [jobStatus, setJobStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [saleData, customerList] = await Promise.all([
          id ? salesApi.get(id) : Promise.resolve(),
          customersApi.list(),
        ])
        setCustomers(customerList)
        if (saleData) {
          setSale(saleData)
          setCustomerId(String(saleData.customer_id ?? ''))
          setCustomerName(saleData.customer_name ?? '')
          setAmountPaid(saleData.amount_paid ? String(saleData.amount_paid) : '')
          setPaymentMethod(saleData.payment_method ?? '')
          setPaymentStatus(saleData.payment_status ?? '')
          setStatus(saleData.status ?? '')
          setJobStatus(saleData.job_status ?? '')
          setNotes(saleData.notes ?? '')
        }
      } catch (err) {
        errorToast(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!id) return

    setSaving(true)

    const payload: Partial<Sale> = {}
    if (customerId) payload.customer_id = Number(customerId)
    if (customerName.trim()) payload.customer_name = customerName.trim()
    if (amountPaid) payload.amount_paid = parseFloat(amountPaid)
    if (paymentMethod) payload.payment_method = paymentMethod
    if (paymentStatus) payload.payment_status = paymentStatus
    if (status) payload.status = status
    if (jobStatus) payload.job_status = jobStatus
    if (notes.trim()) payload.notes = notes.trim()

    try {
      const updated = await salesApi.update(id, payload)
      successToast('Sale updated.')
      navigate(`/sales/${updated.id}`)
    } catch (err) {
      errorToast(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      pageTitle={sale ? `Edit sale #${sale.id}` : 'Edit sale'}
      pageSubtitle="Update sale details, payment, and job status."
      action={<Link to={id ? `/sales/${id}` : '/sales'} className="secondary-button">Back to sale</Link>}
    >
      {loading || !sale ? (
        <LoadingState />
      ) : (
        <>
          <section className="panel module-panel" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px' }}>Sale summary</h3>
            <div className="summary-stack">
              <div className="summary-card">
                <span>Invoice</span>
                <strong>#{sale.invoice_number ?? sale.id}</strong>
              </div>
              <div className="summary-card">
                <span>Total</span>
                <strong>{money(saleTotal(sale))}</strong>
              </div>
              <div className="summary-card">
                <span>Order status</span>
                <strong><StatusPill value={sale.status ?? 'processing'} /></strong>
              </div>
              {sale.job_status && (
                <div className="summary-card">
                  <span>Job status</span>
                  <strong><StatusPill value={sale.job_status} /></strong>
                </div>
              )}
              <div className="summary-card">
                <span>Date</span>
                <strong>{formatDate(sale.transaction_date ?? sale.created_at ?? '')}</strong>
              </div>
            </div>
          </section>

          <section className="panel module-panel">
            <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
              <div className="field-grid">
                <label>
                  <span>Customer</span>
                  <select
                    value={customerId}
                    onChange={(event) => {
                      const val = event.target.value
                      setCustomerId(val)
                      const selected = customers.find((c) => String(c.id) === val)
                      setCustomerName(selected?.name ?? '')
                    }}
                  >
                    <option value="">— Select customer —</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Customer name</span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Override customer name"
                  />
                </label>
                <label>
                  <span>Amount paid</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(event) => setAmountPaid(event.target.value)}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  <span>Payment method</span>
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    {PAYMENT_METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Payment status</span>
                  <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Order status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Job status</span>
                  <select value={jobStatus} onChange={(event) => setJobStatus(event.target.value)}>
                    {JOB_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  <span>Notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="Additional notes about this sale..."
                  />
                </label>
              </div>
              <div className="action-row">
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button className="secondary-button" type="button" onClick={() => navigate(`/sales/${id}`)}>Cancel</button>
              </div>
            </form>
          </section>
        </>
      )}
    </AppShell>
  )
}
