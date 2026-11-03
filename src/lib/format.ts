export const money = (amount: number | string | null | undefined) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0))

export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const prettyLabel = (value?: string | null) =>
  (value ?? '—')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const statusClass = (value?: string | null) =>
  (value ?? 'pending').toLowerCase().replaceAll('_', '-').replaceAll(' ', '-')

export const sumSaleItems = (
  items?: Array<{
    quantity?: number | string | null
    unit_price?: number | string | null
    subtotal?: number | string | null
    total_price?: number | string | null
  }> | null,
) =>
  (items ?? []).reduce((sum, item) => {
    const quantity = Number(item.quantity ?? 0)
    const unitPrice = Number(item.unit_price ?? 0)
    const lineTotal = Number(item.total_price ?? item.subtotal ?? (quantity * unitPrice || 0))
    return sum + lineTotal
  }, 0)

export const saleTotal = (sale?: {
  total_amount?: number | string | null
  items?: Array<{
    quantity?: number | string | null
    unit_price?: number | string | null
    subtotal?: number | string | null
    total_price?: number | string | null
  }> | null
} | null) => {
  const computedTotal = sumSaleItems(sale?.items ?? [])
  const providedTotal = Number(sale?.total_amount ?? 0)
  return computedTotal > 0 ? computedTotal : providedTotal
}

export const initials = (name?: string | null) =>
  (name ?? 'NA')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA'

export const avatarTone = (id: number) => ['blue', 'purple', 'orange', 'green'][id % 4]
