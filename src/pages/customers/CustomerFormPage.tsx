import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customersApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { getErrorMessage } from '../../lib/http'
import Swal from 'sweetalert2'
const emptyForm = {
  name: '',
  phone_number: '',
  email: '',
  company: '',
  location: '',
}

export default function CustomerFormPage() {
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
        const customer = await customersApi.get(id)
        setForm({
          name: customer.name,
          phone_number: customer.phone_number,
          email: customer.email ?? '',
          company: customer.company ?? '',
          location: customer.location ?? '',
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
      phone_number: form.phone_number,
      email: form.email || null,
      company: form.company || null,
      location: form.location || null,
    }

    try {
      const saved = isEdit && id
        ? await customersApi.update(id, payload)
        : await customersApi.create(payload)

      const customerId = 'customer_id' in saved ? saved.customer_id : saved.id

      const result = await Swal.fire({
        title: 'Success',
        text: isEdit ? 'Customer updated successfully' : 'Customer created successfully',
        icon: 'success',
      })

      if (result.isConfirmed) {
        navigate(`/customers/${customerId}`)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      pageTitle={isEdit ? 'Edit customer' : 'Create customer'}
      pageSubtitle="Keep client contact details accurate and complete."
      action={<Link to="/customers" className="secondary-button">Back to customers</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <LoadingState />
      ) : (
        <section className="panel module-panel">
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label>
                <span>Full name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <label>
                <span>Phone number</span>
                <input value={form.phone_number} onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} required />
              </label>
              <label>
                <span>Email address</span>
                <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>Company</span>
                <input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Location</span>
                <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              </label>
            </div>
            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create customer'}
              </button>
              <button className="secondary-button" type="button" onClick={() => navigate('/customers')}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  )
}
