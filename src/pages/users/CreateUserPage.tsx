import { useState, type FormEvent } from 'react'
import { authApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert } from '../../components/PageState'
import { getErrorMessage } from '../../lib/http'

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'assistant' as 'admin' | 'assistant',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const user = await authApi.createUser(form)
      setSuccess(`Created ${user.name} as ${user.role}.`)
      setForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'assistant',
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell pageTitle="Create user" pageSubtitle="Admin-only endpoint for adding workspace accounts.">
      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}
      <section className="panel module-panel">
        <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="field-grid">
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" minLength={8} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            </label>
            <label>
              <span>Confirm password</span>
              <input type="password" minLength={8} value={form.password_confirmation} onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))} required />
            </label>
            <label>
              <span>Role</span>
              <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as 'admin' | 'assistant' }))}>
                <option value="assistant">Assistant</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create user'}
          </button>
        </form>
      </section>
    </AppShell>
  )
}
