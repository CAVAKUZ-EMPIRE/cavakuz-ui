import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { money, prettyLabel } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Product } from '../../types'

export default function ProductShowPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setProduct(await productsApi.get(id))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  return (
    <AppShell
      pageTitle={product ? product.name : 'Product'}
      pageSubtitle="Detailed product information for pricing and stock tracking."
      action={product ? <Link to={`/products/${product.id}/edit`} className="primary-button">Edit product</Link> : undefined}
    >
      {error && <Alert>{error}</Alert>}
      {loading || !product ? <LoadingState /> : (
        <section className="module-grid">
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Category</span>
                <strong>{prettyLabel(product.category ?? 'uncategorised')}</strong>
              </div>
              <div className="summary-card">
                <span>Plain price</span>
                <strong>{money(product.unit_price_plain)}</strong>
              </div>
              <div className="summary-card">
                <span>Branded price</span>
                <strong>{product.unit_price_branded != null ? money(product.unit_price_branded) : '—'}</strong>
              </div>
              <div className="summary-card">
                <span>Stock</span>
                <strong>{product.stock_quantity}</strong>
              </div>
              <div className="summary-card">
                <span>Unit</span>
                <strong>{product.unit_type}</strong>
              </div>
              <div className="summary-card">
                <span>Status</span>
                <strong>{product.is_active ? 'Active' : 'Inactive'}</strong>
              </div>
            </div>
          </div>

          <div className="panel module-panel">
            <div className="inventory-list">
              <div className="inventory-item">
                <div>
                  <strong>Catalog pricing</strong>
                  <small>Base sale values used by the app</small>
                </div>
                <strong>{money(product.unit_price_plain)}</strong>
              </div>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  )
}
