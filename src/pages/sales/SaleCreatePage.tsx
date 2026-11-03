import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { customersApi, inventoryApi, outfitSetupApi, salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import { money, prettyLabel } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import type { Customer, InventoryItem, OutfitSetupGroup } from '../../types'

type InventoryLine = { type: 'inventory'; inventory_id: string; quantity: string }
type OutfitLine = { type: 'outfit'; quantity: string; base_price: string; outfit_setup: Record<string, string> }
type SaleLine = InventoryLine | OutfitLine

const calculateOutfitPrice = (groups: OutfitSetupGroup, setup: Record<string, string>, basePrice: string | number) => {
  let total = Number(basePrice ?? 0)

  Object.entries(setup).forEach(([field, value]) => {
    if (!value) return

    const modifier = Object.values(groups)
      .flat()
      .find((option) => option.field_name === field && option.option_value === value)?.price_modifier ?? 0

    total += Number(modifier)
  })

  return total
}

export default function SaleCreatePage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [outfitGroups, setOutfitGroups] = useState<OutfitSetupGroup>({})
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')
  const [paymentStatus, setPaymentStatus] = useState('full_payment')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<SaleLine[]>([{ type: 'inventory', inventory_id: '', quantity: '1' }])
  const [outfitSelection, setOutfitSelection] = useState<Record<string, string>>({})
  const [outfitBasePrice, setOutfitBasePrice] = useState('0')
  const [outfitQuantity, setOutfitQuantity] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [nextCustomers, nextInventory, nextOutfitGroups] = await Promise.all([
          customersApi.list(),
          inventoryApi.list(),
          outfitSetupApi.list(),
        ])

        setCustomers(nextCustomers)
        setInventory(nextInventory)
        setOutfitGroups(nextOutfitGroups)
        setCustomerId(nextCustomers[0] ? String(nextCustomers[0].id) : '')
        setLines([{ type: 'inventory', inventory_id: nextInventory[0] ? String(nextInventory[0].id) : '', quantity: '1' }])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const outfitUnitPrice = useMemo(
    () => calculateOutfitPrice(outfitGroups, outfitSelection, outfitBasePrice),
    [outfitBasePrice, outfitGroups, outfitSelection],
  )

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        if (line.type === 'inventory') {
          const item = inventory.find((entry) => String(entry.id) === line.inventory_id)
          return sum + (item?.unit_price ?? 0) * Number(line.quantity || 0)
        }

        return sum + calculateOutfitPrice(outfitGroups, line.outfit_setup, line.base_price) * Number(line.quantity || 0)
      }, 0),
    [inventory, lines, outfitGroups],
  )

  const handleAddOutfitLine = () => {
    const requiredFields = Object.keys(outfitGroups)
    const hasMissingSelection = requiredFields.some((field) => !outfitSelection[field])

    if (requiredFields.length > 0 && hasMissingSelection) {
      setError('Please complete every outfit option before adding the custom outfit line.')
      return
    }

    setError('')
    setLines((current) => [...current, {
      type: 'outfit',
      quantity: outfitQuantity,
      base_price: outfitBasePrice,
      outfit_setup: { ...outfitSelection },
    }])
    setOutfitSelection({})
    setOutfitBasePrice('0')
    setOutfitQuantity('1')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const items = lines.map((line) => {
        if (line.type === 'inventory') {
          const item = inventory.find((entry) => String(entry.id) === line.inventory_id)
          const unitPrice = item?.unit_price ?? 0
          const quantity = Number(line.quantity || 0)
          const subtotal = unitPrice * quantity

          return {
            inventory_id: Number(line.inventory_id),
            item_type: 'inventory',
            quantity,
            unit_price: unitPrice,
            subtotal,
            total_price: subtotal,
          }
        }

        const unitPrice = calculateOutfitPrice(outfitGroups, line.outfit_setup, line.base_price)
        const quantity = Number(line.quantity || 0)
        const subtotal = unitPrice * quantity

        return {
          item_type: 'custom_print',
          quantity,
          unit_price: unitPrice,
          subtotal,
          total_price: subtotal,
          attributes: {
            base_price: Number(line.base_price),
            outfit_setup: line.outfit_setup,
          },
        }
      })

      const totalAmount = items.reduce((sum, item) => sum + Number(item.total_price ?? item.subtotal ?? 0), 0)

      const sale = await salesApi.create({
        customer_id: Number(customerId),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes: notes || null,
        total_amount: totalAmount,
        items,
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
      pageSubtitle="Select a customer, add inventory or a custom outfit configuration, and capture payment details."
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
                  <h2>Custom outfit setup</h2>
                  <p>Choose the outfit options and let the price update automatically from the configured modifiers.</p>
                </div>
              </div>

              {Object.entries(outfitGroups).map(([fieldName, options]) => (
                <label key={fieldName}>
                  <span>{prettyLabel(fieldName)}</span>
                  <select
                    value={outfitSelection[fieldName] ?? ''}
                    onChange={(event) => setOutfitSelection((current) => ({ ...current, [fieldName]: event.target.value }))}
                  >
                    <option value="">Select an option</option>
                    {options.map((option) => (
                      <option key={`${fieldName}-${option.option_value}`} value={option.option_value}>
                        {option.option_value} {option.price_modifier ? `(+${money(option.price_modifier)})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <div className="field-grid" style={{ marginTop: 16 }}>
                <label>
                  <span>Base price</span>
                  <input type="number" min="0" step="0.01" value={outfitBasePrice} onChange={(event) => setOutfitBasePrice(event.target.value)} />
                </label>
                <label>
                  <span>Quantity</span>
                  <input type="number" min="1" value={outfitQuantity} onChange={(event) => setOutfitQuantity(event.target.value)} />
                </label>
              </div>

              <div className="record-summary" style={{ marginTop: 16 }}>
                <div>
                  <span>Outfit unit price</span>
                  <strong>{money(outfitUnitPrice)}</strong>
                </div>
                <div>
                  <span>Line total</span>
                  <strong>{money(outfitUnitPrice * Number(outfitQuantity || 0))}</strong>
                </div>
              </div>

              <div className="action-row" style={{ marginTop: 16 }}>
                <button type="button" className="secondary-button" onClick={() => void handleAddOutfitLine()}>
                  <Plus size={16} /> Add custom outfit
                </button>
              </div>
            </div>

            <div className="line-items">
              <div className="panel-heading">
                <div>
                  <h2>Line items</h2>
                  <p>Inventory items and custom outfit selections are all priced into the total.</p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setLines((current) => [...current, { type: 'inventory', inventory_id: inventory[0] ? String(inventory[0].id) : '', quantity: '1' }])}
                >
                  <Plus size={16} /> Add stock line
                </button>
              </div>

              {lines.map((line, index) => {
                if (line.type === 'outfit') {
                  const description = Object.entries(line.outfit_setup)
                    .map(([field, value]) => `${prettyLabel(field)}: ${value}`)
                    .join(' • ') || 'Custom outfit'

                  return (
                    <div className="line-item-row" key={`outfit-${index}`}>
                      <div className="field-grid" style={{ width: '100%' }}>
                        <label style={{ gridColumn: '1 / -1' }}>
                          <span>Custom outfit</span>
                          <input value={description} readOnly />
                        </label>
                        <label>
                          <span>Qty</span>
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index && entry.type === 'outfit'
                              ? { ...entry, quantity: event.target.value }
                              : entry))}
                            required
                          />
                        </label>
                        <label>
                          <span>Base price</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={line.base_price}
                            onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index && entry.type === 'outfit'
                              ? { ...entry, base_price: event.target.value }
                              : entry))}
                          />
                        </label>
                      </div>
                      <div className="line-total">
                        <span>Line total</span>
                        <strong>{money(calculateOutfitPrice(outfitGroups, line.outfit_setup, line.base_price) * Number(line.quantity || 0))}</strong>
                      </div>
                      <button
                        type="button"
                        className="icon-action"
                        aria-label="Remove line"
                        onClick={() => setLines((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                }

                const item = inventory.find((entry) => String(entry.id) === line.inventory_id)
                return (
                  <div className="line-item-row" key={`inventory-${index}`}>
                    <label>
                      <span>Item</span>
                      <select
                        value={line.inventory_id}
                        onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index && entry.type === 'inventory' ? { ...entry, inventory_id: event.target.value } : entry))}
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
                        onChange={(event) => setLines((current) => current.map((entry, entryIndex) => entryIndex === index && entry.type === 'inventory' ? { ...entry, quantity: event.target.value } : entry))}
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
              <button className="primary-button" type="submit" disabled={saving || !customers.length}>
                {saving ? 'Saving...' : 'Create sale'}
              </button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  )
}
