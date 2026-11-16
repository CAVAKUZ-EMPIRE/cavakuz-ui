import { Plus, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { notificationsApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { formatDate } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { NotificationItem } from '../../types'

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showBroadcastForm, setShowBroadcastForm] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [sending, setSending] = useState(false)

  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastSms, setBroadcastSms] = useState(true)

  const [workStatus, setWorkStatus] = useState<'processing' | 'completed' | 'cancelled'>('processing')
  const [statusSms, setStatusSms] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await notificationsApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const markRead = async (item: NotificationItem) => {
    try {
      const updated = await notificationsApi.markRead(item.id)
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return

    setSending(true)
    setError('')
    setSuccess('')
    try {
      const result = await notificationsApi.broadcastMessage({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        send_sms: broadcastSms,
      })
      setSuccess(
        `Sent to ${result.data.total_customers} customers. ` +
        `${result.data.notifications_created} notifications created, ${result.data.sms_sent} SMS sent.`
      )
      setBroadcastTitle('')
      setBroadcastMessage('')
      setShowBroadcastForm(false)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const handleBroadcastStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const result = await notificationsApi.broadcastWorkStatus({
        status: workStatus,
        send_sms: statusSms,
      })
      setSuccess(
        `Status "${result.data.status}" sent to ${result.data.total_orders} orders. ` +
        `${result.data.notifications_created} notifications created, ${result.data.sms_sent} SMS sent.`
      )
      setShowStatusForm(false)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell pageTitle="Notifications" pageSubtitle="Send job status updates and messages to your customers.">
      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="action-row" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="primary-button"
          onClick={() => { setShowBroadcastForm(true); setShowStatusForm(false); setError(''); setSuccess(''); }}
        >
          <Send size={16} /> Send message to all
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => { setShowStatusForm(true); setShowBroadcastForm(false); setError(''); setSuccess(''); }}
        >
          <Plus size={16} /> Notify by order status
        </button>
      </div>

      {showBroadcastForm && (
        <section className="panel module-panel" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>Broadcast Message to All Customers</h3>
          <form onSubmit={handleBroadcast}>
            <div className="field-grid">
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Order update"
                  required
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Your order has been completed..."
                  rows={3}
                  required
                />
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <input
                type="checkbox"
                checked={broadcastSms}
                onChange={(e) => setBroadcastSms(e.target.checked)}
              />
              <span>Send SMS to customers with phone numbers</span>
            </label>
            <div className="action-row" style={{ marginTop: 16 }}>
              <button type="submit" className="primary-button" disabled={sending}>
                {sending ? 'Sending...' : 'Send to all customers'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowBroadcastForm(false)}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showStatusForm && (
        <section className="panel module-panel" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>Notify Customers by Order Status</h3>
          <form onSubmit={handleBroadcastStatus}>
            <div className="field-grid">
              <label>
                <span>Order Status</span>
                <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value as 'processing' | 'completed' | 'cancelled')}>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <input
                type="checkbox"
                checked={statusSms}
                onChange={(e) => setStatusSms(e.target.checked)}
              />
              <span>Send SMS to customers with phone numbers</span>
            </label>
            <div className="action-row" style={{ marginTop: 16 }}>
              <button type="submit" className="primary-button" disabled={sending}>
                {sending ? 'Sending...' : `Notify customers with ${workStatus} orders`}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowStatusForm(false)}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
          <h3 style={{ margin: '0 0 12px' }}>Recent Notifications</h3>
          <div className="notification-list">
            {items.map((item) => (
              <article className={`notification-item ${item.is_read ? 'read' : 'unread'}`} key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{formatDate(item.created_at)}</small>
                </div>
                {!item.is_read && (
                  <button className="secondary-button" type="button" onClick={() => void markRead(item)}>
                    Mark as read
                  </button>
                )}
              </article>
            ))}
            {!items.length && <EmptyState label="No notifications yet." />}
          </div>
        </section>
      )}
    </AppShell>
  )
}
