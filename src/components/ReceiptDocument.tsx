import { BUSINESS } from '../constants/business'
import { formatDate, money, prettyLabel, saleTotal, sumSaleItems } from '../lib/format'
import { outfitDetails, outfitHeadline, saleItemSetup } from '../lib/outfit'
import type { SaleItem, SaleReceipt } from '../types'
import logo from '/images/logo/logo.jpeg'

export type PaperSize = 'A4' | 'A5'

type PaymentTone = 'paid' | 'part' | 'unpaid' | 'neutral'

const PAYMENT_BADGES: Record<string, { label: string; tone: PaymentTone }> = {
  paid: { label: 'Paid', tone: 'paid' },
  full_payment: { label: 'Paid', tone: 'paid' },
  half_payment: { label: 'Part paid', tone: 'part' },
  partial: { label: 'Part paid', tone: 'part' },
  not_paid: { label: 'Unpaid', tone: 'unpaid' },
  pending: { label: 'Unpaid', tone: 'unpaid' },
}

const paymentBadge = (status?: string | null) =>
  PAYMENT_BADGES[(status ?? '').toLowerCase()] ?? { label: prettyLabel(status), tone: 'neutral' as const }

const lineAmount = (item: SaleItem) => item.total_price ?? item.subtotal ?? item.quantity * item.unit_price

function LineDescription({ item }: { item: SaleItem }) {
  const setup = saleItemSetup(item)

  if (!setup) {
    const name = item.inventory?.name ?? item.product?.name
    return <strong className="rdoc-item-name">{name ?? `Item #${item.product_id ?? item.inventory_id ?? item.id}`}</strong>
  }

  return (
    <>
      <strong className="rdoc-item-name">{outfitHeadline(setup)}</strong>
      <span className="rdoc-item-spec">
        {outfitDetails(setup).map(([field, value]) => (
          <span key={field}>{prettyLabel(field)}: {value}</span>
        ))}
      </span>
    </>
  )
}

export default function ReceiptDocument({ receipt, paper }: { receipt: SaleReceipt; paper: PaperSize }) {
  const items = receipt.items ?? []
  const badge = paymentBadge(receipt.payment_status)
  const customer = receipt.customer
  const customerName = customer?.name || receipt.customer_name || 'Walk-in customer'
  const receiptNumber = receipt.invoice_number ?? receipt.receipt_number ?? '—'
  const issuedAt = receipt.created_at ?? receipt.transaction_date
  const contactLine = [BUSINESS.phone, BUSINESS.email].filter(Boolean).join(' • ')

  return (
    <>
      <style>{`@page { size: ${paper} portrait; margin: 0; }`}</style>
      <article className={`rdoc-sheet rdoc-${paper.toLowerCase()}`} aria-label={`Receipt ${receiptNumber}`}>
        <header className="rdoc-header">
          <div className="rdoc-brand">
            <img src={logo} alt="" className="rdoc-logo" />
            <div>
              <strong className="rdoc-brand-name">{BUSINESS.name}</strong>
              {BUSINESS.tagline && <p>{BUSINESS.tagline}</p>}
              {BUSINESS.address && <p>{BUSINESS.address}</p>}
              {contactLine && <p>{contactLine}</p>}
            </div>
          </div>
          <div className="rdoc-doc-title">
            <h2>Receipt</h2>
            <dl className="rdoc-meta">
              <dt>Receipt no.</dt>
              <dd>{receiptNumber}</dd>
              <dt>Date</dt>
              <dd>{formatDate(issuedAt)}</dd>
            </dl>
          </div>
        </header>

        <section className="rdoc-parties">
          <div>
            <p className="rdoc-label">Billed to</p>
            <strong className="rdoc-party-name">{customerName}</strong>
            {customer?.company && <p>{customer.company}</p>}
            {customer?.phone_number && <p>{customer.phone_number}</p>}
            {customer?.email && <p>{customer.email}</p>}
            {customer?.location && <p>{customer.location}</p>}
          </div>
          <div className="rdoc-party-end">
            <p className="rdoc-label">Payment</p>
            <span className={`rdoc-badge rdoc-badge-${badge.tone}`}>{badge.label}</span>
            {receipt.payment_method && <p>Method: {prettyLabel(receipt.payment_method)}</p>}
          </div>
        </section>

        <table className="rdoc-table">
          <thead>
            <tr>
              <th className="rdoc-col-index">#</th>
              <th>Description</th>
              <th className="rdoc-col-num">Qty</th>
              <th className="rdoc-col-num">Unit price</th>
              <th className="rdoc-col-num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="rdoc-col-index">{index + 1}</td>
                <td><LineDescription item={item} /></td>
                <td className="rdoc-col-num">{item.quantity}</td>
                <td className="rdoc-col-num">{money(item.unit_price)}</td>
                <td className="rdoc-col-num">{money(lineAmount(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="rdoc-summary">
          <div className="rdoc-notes">
            {receipt.notes && (
              <>
                <p className="rdoc-label">Notes</p>
                <p>{receipt.notes}</p>
              </>
            )}
          </div>
          <dl className="rdoc-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(sumSaleItems(items))}</dd>
            </div>
            <div className="rdoc-grand-total">
              <dt>Total</dt>
              <dd>{money(saleTotal(receipt))}</dd>
            </div>
          </dl>
        </section>

        <footer className="rdoc-footer">
          <div className="rdoc-signatures">
            <span>Issued by</span>
            <span>Received by</span>
          </div>
          <p className="rdoc-thanks">Thank you for your business.</p>
          <p className="rdoc-fineprint">This is a computer-generated receipt.</p>
        </footer>
      </article>
    </>
  )
}
