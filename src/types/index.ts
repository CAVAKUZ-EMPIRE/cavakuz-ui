export type UserRole = 'admin' | 'assistant'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
}

export type Customer = {
  id: number
  name: string
  phone_number: string
  email: string | null
  location: string | null
  company: string | null
  created_at?: string
  updated_at?: string
}

export type InventoryItem = {
  id: number
  name: string
  category: string | null
  unit_price: number
  stock_quantity: number
  description: string | null
  created_at?: string
}

export type SaleItem = {
  id: number
  sale_id: number
  inventory_id: number
  quantity: number
  unit_price: number
  total_price: number
  inventory?: InventoryItem
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile_money'
export type PaymentStatus = 'full_payment' | 'half_payment' | 'not_paid'

export type Sale = {
  id: number
  customer_id: number
  total_amount: number
  payment_method: PaymentMethod | string
  payment_status: PaymentStatus | string
  transaction_date: string
  notes: string | null
  customer?: Customer
  items?: SaleItem[]
}

export type SaleReceipt = {
  receipt_number: string
  customer: Customer | null
  transaction_date: string
  payment_method: string
  payment_status: string
  items: SaleItem[]
  total_amount: number
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export type Task = {
  id: number
  name: string
  progress: number
  status: TaskStatus | string
  user_id: number | null
  user?: User | null
}

export type Expense = {
  id: number
  name: string
  total: number | string
  created_at?: string
}

export type NotificationItem = {
  id: number
  customer_id: number
  title: string
  message: string
  is_read: boolean
  created_at?: string
}

export type DashboardSummary = {
  total_customers: number
  total_sales: number
  total_revenue: number
  pending_payments: number
  recent_sales: Sale[]
}

export type FinancialMonth = {
  month: string
  total_amount: number | string
  sales_count: number
}

export type ApiEnvelope<T> = {
  message?: string
  data?: T
  user?: User
  token?: string
  code?: number
}
