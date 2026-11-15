import {
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Package,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  adminOnly?: boolean
}

export type NavGroup = {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Sales & Finance',
    icon: FileText,
    items: [
      { label: 'Sales', path: '/sales', icon: FileText },
      { label: 'Expenses', path: '/expenses', icon: Wallet },
      { label: 'Daily Report', path: '/reports/daily', icon: CalendarDays },
      { label: 'Financial Report', path: '/reports/financial', icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    icon: Package,
    items: [
      { label: 'Customers', path: '/customers', icon: Users },
      { label: 'Loyal Customers', path: '/loyal-customers', icon: Award },
      { label: 'Inventory', path: '/inventory', icon: Package },
      // { label: 'Products', path: '/products', icon: Printer },
      // { label: 'Services', path: '/services', icon: HandHelpingIcon },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'Broadcast', path: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Administration',
    icon: UserPlus,
    items: [{ label: 'Create user', path: '/users/new', icon: UserPlus, adminOnly: true }],
  },
]
