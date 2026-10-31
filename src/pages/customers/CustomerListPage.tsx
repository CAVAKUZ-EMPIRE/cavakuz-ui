import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { customersApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { avatarTone, initials } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Customer } from '../../types'

export default function CustomerListPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setCustomers(await customersApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.phone_number} ${customer.email ?? ''} ${customer.company ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [customers, query],
  )

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete ${customer.name}?`)) return
    try {
      await customersApi.remove(customer.id)
      setCustomers((current) => current.filter((item) => item.id !== customer.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AppShell
      pageTitle="Customers"
      pageSubtitle="Your client directory, loaded from the API."
      action={
        <Link to="/customers/new" className="primary-button">
          <Plus size={16} /> Add customer
        </Link>
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <LoadingState label="Loading customers..." />
      ) : (
        <section className="panel module-panel">
          <div className="table-responsive compact-table">
            <table className="table dashboard-table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className={`customer-avatar ${avatarTone(customer.id)}`}>{initials(customer.name)}</div>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td>{customer.phone_number}</td>
                    <td>{customer.email || '—'}</td>
                    <td>{customer.company || '—'}</td>
                    <td>{customer.location || '—'}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-button" to={`/customers/${customer.id}`}>View</Link>
                        <Link className="table-button" to={`/customers/${customer.id}/edit`}>Edit</Link>
                        <button className="table-button danger" type="button" onClick={() => void handleDelete(customer)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState label={query ? 'No customers match that search.' : 'No customers yet.'} />
                    </td>
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
