import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Auth/login.tsx'
import CustomerFormPage from './pages/customers/CustomerFormPage.tsx'
import CustomerListPage from './pages/customers/CustomerListPage.tsx'
import CustomerShowPage from './pages/customers/CustomerShowPage.tsx'
import DashboardPage from './pages/dashboard/DashboardPage.tsx'
import ExpensesPage from './pages/expenses/ExpensesPage.tsx'
import InventoryFormPage from './pages/inventory/InventoryFormPage.tsx'
import InventoryListPage from './pages/inventory/InventoryListPage.tsx'
import InventoryShowPage from './pages/inventory/InventoryShowPage.tsx'
import Notfound from './pages/notfound.tsx'
import NotificationsPage from './pages/notifications/NotificationsPage.tsx'
import FinancialReportPage from './pages/reports/FinancialReportPage.tsx'
import SaleCreatePage from './pages/sales/SaleCreatePage.tsx'
import SaleReceiptPage from './pages/sales/SaleReceiptPage.tsx'
import SaleShowPage from './pages/sales/SaleShowPage.tsx'
import SalesListPage from './pages/sales/SalesListPage.tsx'
import TasksPage from './pages/tasks/TasksPage.tsx'
import CreateUserPage from './pages/users/CreateUserPage.tsx'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={(
          <GuestRoute>
            <Login />
          </GuestRoute>
        )}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:id" element={<CustomerShowPage />} />
        <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/new" element={<InventoryFormPage />} />
        <Route path="/inventory/:id" element={<InventoryShowPage />} />
        <Route path="/inventory/:id/edit" element={<InventoryFormPage />} />

        <Route path="/sales" element={<SalesListPage />} />
        <Route path="/sales/new" element={<SaleCreatePage />} />
        <Route path="/sales/:id" element={<SaleShowPage />} />
        <Route path="/sales/:id/receipt" element={<SaleReceiptPage />} />

        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/reports/financial" element={<FinancialReportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/users/new" element={<CreateUserPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Notfound />} />
    </Routes>
  )
}

export default App
