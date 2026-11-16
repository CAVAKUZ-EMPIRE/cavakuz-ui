import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customersApi, notificationsApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { avatarTone, initials } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Customer } from '../../types'
import UniversalButton from '../../components/UniversalButton'

export default function CustomerShowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [referrerCustomer, setReferrerCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const [showNotify, setShowNotify] = useState(false)
  const [sending, setSending] = useState(false)
  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyMessage, setNotifyMessage] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const nextCustomer = await customersApi.get(id)
        setCustomer(nextCustomer)

        if (nextCustomer.referrer) {
          const referrer = await customersApi.get(nextCustomer.referrer)
          setReferrerCustomer(referrer)
        } else {
          setReferrerCustomer(null)
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleDelete = async () => {
    if (!customer || !window.confirm(`Delete ${customer.name}?`)) return
    try {
      await customersApi.remove(customer.id)
      navigate('/customers')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !notifyTitle.trim() || !notifyMessage.trim()) return

    setSending(true)
    setError('')
    setSuccess('')
    try {
      const result = await notificationsApi.sendCustomerSms(id, {
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
      })
      setSuccess(
        `Notification sent to ${customer?.name}.${result.data.sms_sent ? ' SMS delivered.' : ' SMS was not sent.'}` +
        (result.data.sms_error ? ` Error: ${result.data.sms_error}` : '')
      )
      setNotifyTitle('')
      setNotifyMessage('')
      setShowNotify(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell
      pageTitle="Customer profile"
      pageSubtitle="Review customer details stored in Cavakuz."
      action={
        customer ? (
          <div className="action-row">
            <Link to={`/customers/${customer.id}/edit`} className="primary-button">Edit</Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => { setShowNotify(true); setError(''); setSuccess(''); }}
            >
              <Bell size={16} /> Send SMS
            </button>
            <button type="button" className="btn btn-danger" onClick={() => void handleDelete()}>Delete</button>
          </div>
        ) : undefined
      }
    >
      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {showNotify && (
        <section className="panel module-panel" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>Send SMS to {customer?.name}</h3>
          <form onSubmit={handleNotify}>
            <div className="field-grid">
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  placeholder="Order update"
                  required
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Your order has been completed..."
                  rows={3}
                  required
                />
              </label>
            </div>
            <div className="action-row" style={{ marginTop: 16 }}>
              <button type="submit" className="primary-button" disabled={sending}>
                {sending ? 'Sending...' : 'Send SMS'}
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

      {loading || !customer ? (
        <LoadingState />
      ) : (
        <>
        <UniversalButton />
        <section className="module-grid">
          <div className="panel module-panel">
            <div className="customer-cell" style={{ marginBottom: 22 }}>
              <div className={`customer-avatar ${avatarTone(customer.id)}`}>{initials(customer.name)}</div>
              <div>
                <strong style={{ fontSize: 18 }}>{customer.name}</strong>
                <small>{customer.company || 'Independent client'}</small>
              </div>
            </div>
            <div className="field-grid">
              <label><span>Phone</span><input value={customer.phone_number} readOnly /></label>
              <label><span>Email</span><input value={customer.email || '—'} readOnly /></label>
              <label><span>Company</span><input value={customer.company || '—'} readOnly /></label>
              <label><span>Location</span><input value={customer.location || '—'} readOnly /></label>
              <label><span>Referrer</span><input value={referrerCustomer ? `${referrerCustomer.name} (${referrerCustomer.company || 'Customer'})` : customer.referrer ? `Customer #${customer.referrer}` : '—'} readOnly /></label>
            </div>
          </div>
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Customer ID</span>
                <strong>#{customer.id}</strong>
              </div>
            </div>
            <Link to="/customers" className="secondary-button" style={{ marginTop: 16 }}>Back to list</Link>
          </div>
        </section>
        </>
      )}
    </AppShell>
  )
}
