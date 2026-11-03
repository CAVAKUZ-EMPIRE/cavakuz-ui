import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { money, prettyLabel } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Product } from '../../types'

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await productsApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return

    try {
      await productsApi.remove(product.id)
      setProducts((current) => current.filter((entry) => entry.id !== product.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AppShell
      pageTitle="Products"
      pageSubtitle="Material and service catalog for printing, design, and finishing work."
      action={<Link to="/products/new" className="primary-button"><Plus size={16} /> Add product</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <LoadingState />
      ) : (
        <section className="panel module-panel">
          <div className="inventory-list">
            {products.map((product) => (
              <div className="inventory-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <small>
                    {prettyLabel(product.category ?? 'uncategorised')} · {product.stock_quantity} in stock · {product.unit_type}
                  </small>
                </div>
                <div>
                  <strong>{money(product.unit_price_plain)}</strong>
                  <div className="table-actions" style={{ marginTop: 8 }}>
                    <Link className="table-button" to={`/products/${product.id}`}>View</Link>
                    <Link className="table-button" to={`/products/${product.id}/edit`}>Edit</Link>
                    <button className="table-button danger" type="button" onClick={() => void handleDelete(product)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {!products.length && <EmptyState label="No products yet." />}
          </div>
        </section>
      )}
    </AppShell>
  )
}
