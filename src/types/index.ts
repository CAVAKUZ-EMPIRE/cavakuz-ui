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
  referrer?: number | null
  referrer_customer?: Customer | null
  created_at?: string
  updated_at?: string
}

export type OutfitSetupOption = {
  id: number
  field_name: string
  option_value: string
  price_modifier: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type OutfitSetupGroup = Record<string, OutfitSetupOption[]>

export type InventoryItem = {
  id: number
  name: string
  category: string | null
  unit_price: number
  stock_quantity: number
  description: string | null
  created_at?: string
}

export type ProductCategory = 'designing' | 'printing' | 'paper_job' | 'finishing' | 'large_format' | 'souvenir'

export type Product = {
  id: number
  name: string
  category: ProductCategory | string | null
  unit_price_plain: number
  unit_price_branded: number | null
  stock_quantity: number
  unit_type: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type SaleItem = {
  id: number
  sale_id: number
  product_id?: number | null
  inventory_id?: number | null
  item_type?: string
  quantity: number
  unit_price: number
  subtotal?: number
  total_price?: number
  attributes?: Record<string, unknown> | null
  product?: Product
  inventory?: InventoryItem
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile_money'
export type PaymentStatus = 'full_payment' | 'half_payment' | 'not_paid' | 'pending' | 'partial' | 'paid'

export type Sale = {
  id: number
  invoice_number?: string
  customer_id?: number | null
  customer_name?: string | null
  total_amount: number
  payment_method?: PaymentMethod | string
  payment_status?: PaymentStatus | string
  status?: string
  transaction_date?: string
  created_at?: string
  notes: string | null
  customer?: Customer
  items?: SaleItem[]
}

export type SaleReceipt = {
  receipt_number?: string
  invoice_number?: string
  customer: Customer | null
  customer_name?: string | null
  transaction_date?: string
  created_at?: string
  payment_method?: string
  payment_status: string
  notes?: string | null
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
