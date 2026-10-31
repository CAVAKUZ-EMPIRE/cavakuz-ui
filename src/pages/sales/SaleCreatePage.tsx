import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { customersApi, inventoryApi, salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Customer, InventoryItem } from '../../types'

type Line = { inventory_id: string; quantity: string }

export default function SaleCreatePage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')
  const [paymentStatus, setPaymentStatus] = useState('full_payment')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<Line[]>([{ inventory_id: '', quantity: '1' }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [nextCustomers, nextInventory] = await Promise.all([customersApi.list(), inventoryApi.list()])
        setCustomers(nextCustomers)
        setInventory(nextInventory)
        setCustomerId(nextCustomers[0] ? String(nextCustomers[0].id) : '')
        setLines([{ inventory_id: nextInventory[0] ? String(nextInventory[0].id) : '', quantity: '1' }])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const item = inventory.find((entry) => String(entry.id) === line.inventory_id)
        return sum + (item?.unit_price ?? 0) * Number(line.quantity || 0)
      }, 0),
    [inventory, lines],
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const sale = await salesApi.create({
        customer_id: Number(customerId),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes: notes || null,
        items: lines.map((line) => ({
          inventory_id: Number(line.inventory_id),
          quantity: Number(line.quantity),
        })),
      })
      navigate(`/sales/${sale.id}/receipt`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      pageTitle="Record a sale"
      pageSubtitle="Select a customer, add line items, and capture payment details."
      action={<Link to="/sales" className="secondary-button">Back to sales</Link>}
    >
      {error && <Alert>{error}</Alert>}
      {loading ? <LoadingState /> : (
        <section className="panel module-panel">
          <form className="field-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="field-grid">
              <label>
                <span>Customer</span>
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Payment method</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="mobile_money">Mobile money</option>
                </select>
              </label>
              <label>
                <span>Payment status</span>
                <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                  <option value="full_payment">Full payment</option>
                  <option value="half_payment">Half payment</option>
                  <option value="not_paid">Not paid</option>
                </select>
              </label>
              <label>
                <span>Notes</span>
                <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional" />
              </label>
            </div>

            <div className="line-items">
              <div className="panel-heading">
                <div>
                  <h2>Line items</h2>
                  <p>Quantity is multiplied by the live unit price on the server.</p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setLines((current) => [...current, { inventory_id: inventory[0] ? String(inventory[0].id) : '', quantity: '1' }])}
                >
                  <Plus size={16} /> Add line
                </button>
              </div>

              {lines.map((line, index) => {
                const item = inventory.find((entry) => String(entry.id) === line.inventory_id)
                return (
                  <div className="line-item-row" key={`${line.inventory_id}-${index}`}>
                    <label>
                      <span>Item</span>
                      <select
                        value={line.inventory_id}
                        onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, inventory_id: event.target.value } : entry))}
                        required
                      >
                        {inventory.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name} ({entry.stock_quantity} in stock)
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, quantity: event.target.value } : entry))}
                        required
                      />
                    </label>
                    <div className="line-total">
                      <span>Line total</span>
                      <strong>{money((item?.unit_price ?? 0) * Number(line.quantity || 0))}</strong>
                    </div>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        className="icon-action"
                        aria-label="Remove line"
                        onClick={() => setLines((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="record-summary">
              <div>
                <span>Estimated total</span>
                <strong>{money(estimatedTotal)}</strong>
              </div>
              <div>
                <span>Items</span>
                <strong>{lines.length}</strong>
              </div>
            </div>

            <div className="action-row">
              <button className="primary-button" type="submit" disabled={saving || !customers.length || !inventory.length}>
                {saving ? 'Saving...' : 'Create sale'}
              </button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  )
}
