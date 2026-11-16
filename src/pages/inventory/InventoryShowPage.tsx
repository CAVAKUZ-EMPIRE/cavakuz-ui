import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { inventoryApi } from '../../api'
import AppShell from '../../components/AppShell'
import { LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { inventorySetup, inventoryTitle } from '../../lib/outfit'
import OutfitSetupChips from '../../components/OutfitSetupChips'
import { getErrorMessage } from '../../lib/http'
import { confirmDelete, errorToast } from '../../lib/swal'
import type { InventoryItem } from '../../types'

export default function InventoryShowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setItem(await inventoryApi.get(id))
      } catch (err) {
        errorToast(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleDelete = async () => {
    if (!item) return
    const confirmed = await confirmDelete(`Delete "${inventoryTitle(item)}"? This action cannot be undone.`)
    if (!confirmed) return
    try {
      await inventoryApi.remove(item.id)
      navigate('/inventory')
    } catch (err) {
      errorToast(getErrorMessage(err))
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
      {loading || !item ? <LoadingState /> : (
        <section className="panel module-panel">
          <div className="summary-stack">
            <div className="summary-card highlight">
              <span className="line-title">{inventoryTitle(item)}</span>
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
          {inventorySetup(item) ? (
            <div className="line-label" style={{ marginTop: 18 }}>
              <OutfitSetupChips setup={inventorySetup(item)!} />
            </div>
          ) : (
            <p style={{ marginTop: 18 }}>{item.description || 'No description provided.'}</p>
          )}
        </section>
      )}
    </AppShell>
  )
}
