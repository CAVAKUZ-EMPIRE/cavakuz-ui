import {
  BarChart3,
  Bell,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Printer,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import logo from '/images/logo/logo.jpeg'
export type SidebarItem = {
  label: string
  path: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Inventory', path: '/inventory', icon: Package },
  { label: 'Sales', path: '/sales', icon: FileText },
  { label: 'Expenses', path: '/expenses', icon: Wallet },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Financial Report', path: '/reports/financial', icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Create user', path: '/users/new', icon: UserPlus, adminOnly: true },
]

type UniversalSidebarProps = {
  sidebarOpen: boolean
  onClose: () => void
}

export default function UniversalSidebar({ sidebarOpen, onClose }: UniversalSidebarProps) {
  const navigate = useNavigate()
  const { logout, isAdmin } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const items = sidebarItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {sidebarOpen && (
        <button className="sidebar-backdrop" aria-label="Close menu" onClick={onClose} />
      )}

      <aside className={`cavakuz-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div>
            {/* <div className="brand-name">CAVAKUZ EMPIRE</div> */}
            <img src={logo} alt="logo" className='sidebar-logo' />
            <div className="brand-tagline">Sales • Service • Finance</div>
          </div>
          <button className="mobile-close" aria-label="Close menu" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="sidebar-nav">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={`${label}-${path}`}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-caption">SESSION</div>
          <button className="nav-link-custom" onClick={() => void handleLogout()}>
            <LogOut size={19} />
            <span>Log out</span>
          </button>

          <div className="sidebar-promo">
            <div className="promo-icon"><Printer size={20} /></div>
            <strong>Make great work.</strong>
            <p>Track customers, payments, inventory and performance in one place.</p>
          </div>
        </div>
      </aside>
    </>
  )
}
