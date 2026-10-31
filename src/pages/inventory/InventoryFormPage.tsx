import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { inventoryApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { getErrorMessage } from '../../lib/http'

const emptyForm = {
  name: '',
  category: '',
  unit_price: '0',
  stock_quantity: '0',
  description: '',
}

export default function InventoryFormPage() {
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
        const item = await inventoryApi.get(id)
        setForm({
          name: item.name,
          category: item.category ?? '',
          unit_price: String(item.unit_price),
          stock_quantity: String(item.stock_quantity),
          description: item.description ?? '',
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
      category: form.category || null,
      unit_price: Number(form.unit_price),
      stock_quantity: Number(form.stock_quantity),
      description: form.description || null,
    }
    try {
      const saved = isEdit && id
        ? await inventoryApi.update(id, payload)
        : await inventoryApi.create(payload)
      navigate(`/inventory/${saved.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      pageTitle={isEdit ? 'Edit inventory item' : 'Add inventory item'}
      pageSubtitle="Prices and stock quantities are used when recording sales."
      action={<Link to="/inventory" className="secondary-button">Back to inventory</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label>
                <span>Name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                <span>Category</span>
                <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </label>
              <label>
                <span>Unit price</span>
                <input type="number" min={0} step="0.01" value={form.unit_price} onChange={(event) => setForm((current) => ({ ...current, unit_price: event.target.value }))} required />
              </label>
              <label>
                <span>Stock quantity</span>
                <input type="number" min={0} value={form.stock_quantity} onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))} required />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Description</span>
                <textarea className="form-textarea" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
            </div>
            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create item'}</button>
              <button className="secondary-button" type="button" onClick={() => navigate('/inventory')}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  )
}
