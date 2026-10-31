import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customersApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { avatarTone, initials } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Customer } from '../../types'

export default function CustomerShowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setCustomer(await customersApi.get(id))
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

  return (
    <AppShell
      pageTitle="Customer profile"
      pageSubtitle="Review customer details stored in Cavakuz."
      action={
        customer ? (
          <div className="action-row">
            <Link to={`/customers/${customer.id}/edit`} className="primary-button">Edit</Link>
            <button type="button" className="secondary-button" onClick={() => void handleDelete()}>Delete</button>
          </div>
        ) : undefined
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading || !customer ? (
        <LoadingState />
      ) : (
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
      )}
    </AppShell>
  )
}
