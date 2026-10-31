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

  return (
    <AppShell pageTitle="Notifications" pageSubtitle="Messages returned by the notifications API.">
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
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
