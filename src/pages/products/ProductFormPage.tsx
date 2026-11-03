import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { getErrorMessage } from '../../lib/http'

const emptyForm = {
  name: '',
  category: 'souvenir',
  unit_price_plain: '0',
  unit_price_branded: '0',
  stock_quantity: '0',
  unit_type: 'piece',
  is_active: '1',
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const product = await productsApi.get(id)
        setForm({
          name: product.name,
          category: product.category ?? 'souvenir',
          unit_price_plain: String(product.unit_price_plain),
          unit_price_branded: String(product.unit_price_branded ?? 0),
          stock_quantity: String(product.stock_quantity),
          unit_type: product.unit_type ?? 'piece',
          is_active: product.is_active ? '1' : '0',
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      category: form.category,
      unit_price_plain: Number(form.unit_price_plain),
      unit_price_branded: form.unit_price_branded === '' ? null : Number(form.unit_price_branded),
      stock_quantity: Number(form.stock_quantity),
      unit_type: form.unit_type,
      is_active: form.is_active === '1',
    }

    try {
      const saved = isEdit && id
        ? await productsApi.update(id, payload)
        : await productsApi.create(payload)
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      pageTitle={isEdit ? 'Edit product' : 'Add product'}
      pageSubtitle="Add a material, service, or product variant for the print-shop catalog."
      action={<Link to="/products" className="secondary-button">Back to products</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label>
                <span>product Name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>

              <label>
                <span>product Type</span>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  <option value="designing">Designing</option>
                  <option value="printing">Printing</option>
                </select>
              </label>

              {/* <label>
                <span>Plain unit price</span>
                <input type="number" min={0} step="0.01" value={form.unit_price_plain} onChange={(event) => setForm((current) => ({ ...current, unit_price_plain: event.target.value }))} required />
              </label> */}

              {/* <label>
                <span>Branded unit price</span>
                <input type="number" min={0} step="0.01" value={form.unit_price_branded} onChange={(event) => setForm((current) => ({ ...current, unit_price_branded: event.target.value }))} />
              </label>

              <label>
                <span>Stock quantity</span>
                <input type="number" min={0} value={form.stock_quantity} onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))} required />
              </label> */}

              {/* <label>
                <span>Unit type</span>
                <select value={form.unit_type} onChange={(event) => setForm((current) => ({ ...current, unit_type: event.target.value }))}>
                  <option value="sheet">Sheet</option>
                  <option value="piece">Piece</option>
                  <option value="roll">Roll</option>
                  <option value="pack">Pack</option>
                </select>
              </label> */}

              <label>
                <span>Active</span>
                <select value={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value }))}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </label>
            </div>

            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}</button>
              <button className="secondary-button" type="button" onClick={() => navigate('/products')}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  )
}
