import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { dashboardApi, expensesApi } from '../../api'
import AppShell from '../../components/AppShell'
import { EmptyState, LoadingState } from '../../components/PageState'
import { money } from '../../lib/format'
import { getErrorMessage } from '../../lib/http'
import { errorToast } from '../../lib/swal'
import type { Expense, FinancialMonth } from '../../types'

export default function FinancialReportPage() {
  const [months, setMonths] = useState<FinancialMonth[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [report, nextExpenses] = await Promise.all([
          dashboardApi.financialReport(),
          expensesApi.list(),
        ])
        setMonths(report)
        setExpenses(nextExpenses)
      } catch (err) {
        errorToast(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const totals = useMemo(() => {
    const income = months.reduce((sum, month) => sum + Number(month.total_amount || 0), 0)
    const salesCount = months.reduce((sum, month) => sum + Number(month.sales_count || 0), 0)
    const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.total || 0), 0)
    return { income, salesCount, expenseTotal, net: income - expenseTotal }
  }, [months, expenses])

  const handleExportPdf = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Financial Report', 14, 15)

    autoTable(doc, {
      startY: 22,
      head: [['Month', 'Revenue', 'Sales Count']],
      body: months.map((month) => [
        month.month || 'Unknown',
        money(Number(month.total_amount || 0)),
        month.sales_count,
      ]),
      foot: [['Totals', money(totals.income), totals.salesCount]],
      theme: 'striped',
      headStyles: { fillColor: [53, 92, 224] },
      footStyles: { fillColor: [240, 244, 255], textColor: [25, 39, 72], fontStyle: 'bold' },
    })

    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40
    doc.text(`Total Expenses: ${money(totals.expenseTotal)}`, 14, finalY + 10)
    doc.text(`Net: ${money(totals.net)}`, 14, finalY + 17)

    doc.save('financial-report.pdf')
  }

  const handleExportExcel = () => {
    const rows = months.map((month) => ({
      Month: month.month || 'Unknown',
      Revenue: Number(month.total_amount || 0),
      'Sales Count': month.sales_count,
    }))

    rows.push({
      Month: 'Totals',
      Revenue: totals.income,
      'Sales Count': totals.salesCount,
    })
    rows.push({ Month: 'Expenses', Revenue: totals.expenseTotal, 'Sales Count': 0 })
    rows.push({ Month: 'Net', Revenue: totals.net, 'Sales Count': 0 })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report')
    XLSX.writeFile(workbook, 'financial-report.xlsx')
  }

  return (
    <AppShell pageTitle="Financial report" pageSubtitle="Monthly revenue grouped by the reports API.">
      {loading ? <LoadingState /> : (
        <>
          <div className="dr-export-buttons" role="group" aria-label="Export options">
            <button type="button" className="export-btn export-pdf" onClick={() => void handleExportPdf()}>
              <Download size={14} /> Export PDF
            </button>
            <button type="button" className="export-btn export-excel" onClick={() => void handleExportExcel()}>
              <Download size={14} /> Export Excel
            </button>
          </div>
          <section className="module-grid">
          <div className="panel module-panel">
            <div className="summary-stack">
              <div className="summary-card highlight">
                <span>Total income</span>
                <strong>{money(totals.income)}</strong>
              </div>
              <div className="summary-card">
                <span>Sales count</span>
                <strong>{totals.salesCount}</strong>
              </div>
              <div className="summary-card">
                <span>Expenses</span>
                <strong>{money(totals.expenseTotal)}</strong>
              </div>
              <div className="summary-card">
                <span>Net</span>
                <strong>{money(totals.net)}</strong>
              </div>
            </div>
          </div>
          <div className="panel module-panel">
            <div className="report-list">
              {months.map((month) => (
                <div className="report-row" key={month.month}>
                  <span>{month.month || 'Unknown month'}</span>
                  <strong>{money(month.total_amount)} · {month.sales_count} sales</strong>
                </div>
              ))}
              {!months.length && <EmptyState label="No financial data yet." />}
            </div>
          </div>
        </section>
        </>
      )}
    </AppShell>
  )
}
