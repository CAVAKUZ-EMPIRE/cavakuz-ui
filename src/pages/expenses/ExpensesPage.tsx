import { useEffect, useState, type FormEvent } from 'react'
import { expensesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, EmptyState, LoadingState } from '../../components/PageState'
import { formatDate, money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Expense } from '../../types'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [name, setName] = useState('')
  const [total, setTotal] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setExpenses(await expensesApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const resetForm = () => {
    setName('')
    setTotal('')
    setEditingId(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        await expensesApi.update(editingId, { name, total })
        setSuccess('Expense updated.')
      } else {
        await expensesApi.create({ name, total })
        setSuccess('Expense created.')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setName(expense.name)
    setTotal(String(expense.total))
  }

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete ${expense.name}?`)) return
    try {
      await expensesApi.remove(expense.id)
      setExpenses((current) => current.filter((item) => item.id !== expense.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.total || 0), 0)

  return (
    <AppShell pageTitle="Expenses" pageSubtitle="Track outgoing costs against sales revenue.">
      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}
      <section className="module-grid two-column">
        <div className="panel module-panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? 'Update expense' : 'Add expense'}</h2>
              <p>Name and Amount are required by the API.</p>
            </div>
          </div>
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label>
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label>
                <span>Amount</span>
                <input type="number" min={0} step="0.01" value={total} onChange={(event) => setTotal(event.target.value)} required />
              </label>
            </div>
            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create expense'}
              </button>
              {editingId && (
                <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
        <div className="panel module-panel">
          <div className="summary-card highlight">
            <span>Total expenses</span>
            <strong>{money(expenseTotal)}</strong>
          </div>
        </div>
      </section>

      {loading ? <LoadingState /> : (
        <section className="panel module-panel" style={{ marginTop: 20 }}>
          <div className="table-responsive compact-table">
            <table className="table dashboard-table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.name}</td>
                    <td>{money(expense.total)}</td>
                    <td>{formatDate(expense.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-button" type="button" onClick={() => handleEdit(expense)}>Edit</button>
                        <button className="table-button danger" type="button" onClick={() => void handleDelete(expense)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!expenses.length && (
                  <tr>
                    <td colSpan={4}><EmptyState label="No expenses yet." /></td>
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
