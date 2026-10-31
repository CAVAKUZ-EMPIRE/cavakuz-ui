import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { inventoryApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { InventoryItem } from '../../types'

export default function InventoryListPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await inventoryApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      await inventoryApi.remove(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AppShell
      pageTitle="Inventory"
      pageSubtitle="Services and stock items from the catalogue API."
      action={<Link to="/inventory/new" className="primary-button"><Plus size={16} /> Add item</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <LoadingState />
      ) : (
        <section className="panel module-panel">
          <div className="inventory-list">
            {items.map((item) => (
              <div className="inventory-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.category || 'Uncategorised'} · {item.stock_quantity} in stock</small>
                </div>
                <div>
                  <strong>{money(item.unit_price)}</strong>
                  <div className="table-actions" style={{ marginTop: 8 }}>
                    <Link className="table-button" to={`/inventory/${item.id}`}>View</Link>
                    <Link className="table-button" to={`/inventory/${item.id}/edit`}>Edit</Link>
                    <button className="table-button danger" type="button" onClick={() => void handleDelete(item)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {!items.length && <EmptyState label="No inventory items yet." />}
          </div>
        </section>
      )}
    </AppShell>
  )
}
