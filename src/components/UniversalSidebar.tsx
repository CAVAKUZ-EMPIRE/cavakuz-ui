import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../auth/AuthContext'
import { navigation } from '../constants/navigation'
import { initials } from '../lib/format'
import logo from '/images/logo/logo.jpeg'

type UniversalSidebarProps = {
  sidebarOpen: boolean
  collapsed: boolean
  isMobile: boolean
  onClose: () => void
  onToggleCollapsed: () => void
}

export default function UniversalSidebar({ sidebarOpen, collapsed, isMobile, onClose, onToggleCollapsed }: UniversalSidebarProps) {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()

  useEffect(() => {
    if (!sidebarOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, onClose])

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    })

    if (result.isConfirmed) {
      await logout()
      navigate('/login', { replace: true })
    }
  }

  const groups = navigation
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.adminOnly || isAdmin) }))
    .filter((group) => group.items.length > 0)

  return (
    <>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={onClose} />}

      <aside
        className={`cavakuz-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        aria-label="Main navigation"
        inert={isMobile && !sidebarOpen}
      >
        <div className="brand">
          <Link to="/" onClick={onClose} aria-label="Cavakuz Empire home">
            <img src={logo} alt="Cavakuz Empire" className="sidebar-brand-logo" />
          </Link>
          <button className="mobile-close" aria-label="Close menu" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="sidebar-scroll">
          {groups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-caption">{group.label}</div>
              <div className="sidebar-nav">
                {group.items.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === '/dashboard'}
                    className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                    title={collapsed ? label : undefined}
                    aria-label={label}
                    onClick={onClose}
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-link-custom sidebar-collapse-btn"
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand sidebar' : undefined}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            <span>Collapse</span>
          </button>

          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">{initials(user?.name)}</div>
            <div className="sidebar-user-copy">
              <strong>{user?.name ?? 'Workspace user'}</strong>
              <small>{user?.role ?? 'assistant'}</small>
            </div>
            <button type="button" className="sidebar-logout" aria-label="Log out" title="Log out" onClick={() => void handleLogout()}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
