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

export const initials = (name?: string | null) =>
  (name ?? 'NA')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA'

export const avatarTone = (id: number) => ['blue', 'purple', 'orange', 'green'][id % 4]
