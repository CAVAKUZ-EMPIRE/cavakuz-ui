import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { inventoryApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { InventoryItem } from '../../types'

export default function InventoryShowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setItem(await inventoryApi.get(id))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleDelete = async () => {
    if (!item || !window.confirm(`Delete ${item.name}?`)) return
    try {
      await inventoryApi.remove(item.id)
      navigate('/inventory')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AppShell
      pageTitle="Inventory item"
      pageSubtitle="Item details from the inventory API."
      action={
        item ? (
          <div className="action-row">
            <Link to={`/inventory/${item.id}/edit`} className="primary-button">Edit</Link>
            <button type="button" className="secondary-button" onClick={() => void handleDelete()}>Delete</button>
          </div>
        ) : undefined
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading || !item ? <LoadingState /> : (
        <section className="panel module-panel">
          <div className="summary-stack">
            <div className="summary-card highlight">
              <span>{item.name}</span>
              <strong>{money(item.unit_price)}</strong>
            </div>
            <div className="summary-card">
              <span>Stock</span>
              <strong>{item.stock_quantity}</strong>
            </div>
            <div className="summary-card">
              <span>Category</span>
              <strong>{item.category || '—'}</strong>
            </div>
          </div>
          <p style={{ marginTop: 18 }}>{item.description || 'No description provided.'}</p>
        </section>
      )}
    </AppShell>
  )
}
