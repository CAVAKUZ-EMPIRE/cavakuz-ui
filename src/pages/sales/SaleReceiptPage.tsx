import { Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { salesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { Alert, LoadingState } from '../../components/PageState'
import ReceiptDocument, { type PaperSize } from '../../components/ReceiptDocument'
import { getErrorMessage } from '../../lib/http'
import type { SaleReceipt } from '../../types'

const PAPER_SIZES: PaperSize[] = ['A4', 'A5']
const PAPER_STORAGE_KEY = 'cavakuz.receipt.paper'

export default function SaleReceiptPage() {
  const { id } = useParams()
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [paper, setPaper] = useState<PaperSize>(() => (localStorage.getItem(PAPER_STORAGE_KEY) === 'A5' ? 'A5' : 'A4'))

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setReceipt(await salesApi.receipt(id))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const choosePaper = (size: PaperSize) => {
    setPaper(size)
    localStorage.setItem(PAPER_STORAGE_KEY, size)
  }

  return (
    <AppShell
      pageTitle="Sale receipt"
      pageSubtitle="Choose a paper size, then print or save as PDF."
      action={
        <div className="action-row">
          <div className="rdoc-paper-toggle" role="group" aria-label="Paper size">
            {PAPER_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={size === paper ? 'active' : ''}
                aria-pressed={size === paper}
                onClick={() => choosePaper(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <Link to="/sales" className="secondary-button">Back to sales</Link>
        </div>
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading || !receipt ? <LoadingState /> : (
        <div className="rdoc-stage">
          <ReceiptDocument receipt={receipt} paper={paper} />
        </div>
      )}
    </AppShell>
  )
}
