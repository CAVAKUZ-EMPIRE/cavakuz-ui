import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loyalCustomersApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { avatarTone, initials } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { LoyalCustomer } from '../../types'

export default function LoyalCustomersPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [customers, setCustomers] = useState<LoyalCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        setCustomers(await loyalCustomersApi.list())
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
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

  return (
    <AppShell
      pageTitle="Loyal Customers"
      pageSubtitle="Top customers ranked by referrals and purchases."
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <LoadingState label="Loading loyal customers..." />
      ) : (
        <section className="panel module-panel">
          <div className="table-responsive compact-table">
            <table className="table dashboard-table align-middle">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Referrals</th>
                  <th>Purchases</th>
                  <th>Loyalty Score</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className={`customer-avatar ${avatarTone(customer.id)}`}>{initials(customer.name)}</div>
                        <div>
                          <strong>{customer.name}</strong>
                          <small>{customer.email || '—'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{customer.phone_number}</td>
                    <td>{customer.company || '—'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>
                        {customer.referral_count}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#3b82f6', color: '#fff' }}>
                        {customer.purchase_count}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: index < 3 ? '#f59e0b' : 'inherit' }}>
                        {index < 3 && ['🥇', '🥈', '🥉'][index]} {customer.loyalty_score}
                      </strong>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="table-button" to={`/customers/${customer.id}`}>View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState label={query ? 'No loyal customers match that search.' : 'No loyal customers yet.'} />
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
