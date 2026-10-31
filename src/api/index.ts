import api from '../lib/apiClient'
import { unwrapData, unwrapList } from '../lib/http'
import type {
  Customer,
  DashboardSummary,
  Expense,
  FinancialMonth,
  InventoryItem,
  NotificationItem,
  Sale,
  SaleReceipt,
  Task,
  User,
} from '../types'

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/login', { email, password })
    return {
      token: data.token as string,
      user: data.user as User,
      message: data.message as string | undefined,
    }
  },
  logout: async () => {
    await api.post('/logout')
  },
  me: async () => {
    const { data } = await api.get('/me')
    return (data.user ?? unwrapData<User>(data)) as User
  },
  createUser: async (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: 'admin' | 'assistant'
  }) => {
    const { data } = await api.post('/users', payload)
    return data.user as User
  },
}

export const dashboardApi = {
  summary: async () => {
    const { data } = await api.get('/dashboard')
    return unwrapData<DashboardSummary>(data)
  },
  admin: async () => {
    const { data } = await api.get('/admin/dashboard')
    return unwrapData<DashboardSummary>(data)
  },
  financialReport: async () => {
    const { data } = await api.get('/reports/financial')
    return unwrapList<FinancialMonth>(data)
  },
}

export const customersApi = {
  list: async () => {
    const { data } = await api.get('/customers')
    return unwrapList<Customer>(data)
  },
  get: async (id: string | number) => {
    const { data } = await api.get(`/customers/${id}`)
    return unwrapData<Customer>(data)
  },
  create: async (payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data } = await api.post('/customers', payload)
    return unwrapData<Customer>(data)
  },
  update: async (id: string | number, payload: Partial<Customer>) => {
    const { data } = await api.put(`/customers/${id}`, payload)
    return unwrapData<Customer>(data)
  },
  remove: async (id: string | number) => {
    await api.delete(`/customers/${id}`)
  },
}

export const inventoryApi = {
  list: async () => {
    const { data } = await api.get('/inventory')
    return unwrapList<InventoryItem>(data)
  },
  get: async (id: string | number) => {
    const { data } = await api.get(`/inventory/${id}`)
    return unwrapData<InventoryItem>(data)
  },
  create: async (payload: {
    name: string
    category?: string | null
    unit_price: number
    stock_quantity: number
    description?: string | null
  }) => {
    const { data } = await api.post('/inventory', payload)
    return unwrapData<InventoryItem>(data)
  },
  update: async (id: string | number, payload: Partial<InventoryItem>) => {
    const { data } = await api.put(`/inventory/${id}`, payload)
    return unwrapData<InventoryItem>(data)
  },
  remove: async (id: string | number) => {
    await api.delete(`/inventory/${id}`)
  },
}

export const salesApi = {
  list: async () => {
    const { data } = await api.get('/sales')
    return unwrapList<Sale>(data)
  },
  get: async (id: string | number) => {
    const { data } = await api.get(`/sales/${id}`)
    return unwrapData<Sale>(data)
  },
  create: async (payload: {
    customer_id: number
    payment_method: string
    payment_status: string
    notes?: string | null
    items: Array<{ inventory_id: number; quantity: number }>
  }) => {
    const { data } = await api.post('/sales', payload)
    return unwrapData<Sale>(data)
  },
  receipt: async (id: string | number) => {
    const { data } = await api.get(`/sales/${id}/receipt`)
    return unwrapData<SaleReceipt>(data)
  },
}

export const tasksApi = {
  list: async () => {
    const { data } = await api.get('/tasks')
    return unwrapList<Task>(data)
  },
  get: async (id: string | number) => {
    const { data } = await api.get(`/tasks/${id}`)
    return unwrapData<Task>(data)
  },
  create: async (payload: { name: string; progress: number; status: string; user_id?: number | null }) => {
    const { data } = await api.post('/tasks', payload)
    return unwrapData<Task>(data)
  },
  update: async (id: string | number, payload: Partial<Task>) => {
    const { data } = await api.put(`/tasks/${id}`, payload)
    return unwrapData<Task>(data)
  },
  remove: async (id: string | number) => {
    await api.delete(`/tasks/${id}`)
  },
}

export const expensesApi = {
  list: async () => {
    const { data } = await api.get('/expenses')
    return unwrapList<Expense>(data)
  },
  get: async (id: string | number) => {
    const { data } = await api.get(`/expenses/${id}`)
    return unwrapData<Expense>(data)
  },
  create: async (payload: { name: string; total: number | string }) => {
    const { data } = await api.post('/expenses', payload)
    return unwrapData<Expense>(data)
  },
  update: async (id: string | number, payload: { name?: string; total?: number | string }) => {
    const { data } = await api.put(`/expenses/${id}`, payload)
    return unwrapData<Expense>(data)
  },
  remove: async (id: string | number) => {
    await api.delete(`/expenses/${id}`)
  },
}

export const notificationsApi = {
  list: async () => {
    const { data } = await api.get('/notifications')
    return unwrapList<NotificationItem>(data)
  },
  markRead: async (id: string | number) => {
    const { data } = await api.post(`/notifications/${id}/read`)
    return unwrapData<NotificationItem>(data)
  },
}
